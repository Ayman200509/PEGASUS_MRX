import fs from 'fs/promises';
import * as fsSync from 'fs';
import path from 'path';

// Define the path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src/data.json');

export interface Product {
    id: string;
    title: string;
    price: string;
    type: string;
    inStock: boolean;
    description?: string;
    oldPrice?: string;
    imageColor?: string;
    image?: string;
    images?: string[];
    videos?: string[];
    content?: string;
    customFields?: { label: string; required: boolean; type: string }[];
    position?: number;
}

export interface Profile {
    name: string;
    handle: string;
    type: string;
    tagline?: string;
    avatar?: string;
    socials?: {
        telegram?: string;
        twitter?: string;
        instagram?: string;
        discord?: string;
        youtube?: string;
        website?: string;
    };
    payout?: {
        network?: string;
        address?: string;
    };
    telegramWidget?: {
        enabled: boolean;
        username: string;
        text?: string;
    };
    productsCount: number;
    salesCount: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
}

export interface Order {
    id: string;
    customerEmail: string;
    customerTelegram: string;
    items: {
        productId: string;
        title: string;
        price: string;
        quantity: number;
        customValues?: { [label: string]: string };
        serviceMessage?: string;
    }[];
    total: string;
    status: string;
    date: string;
    ip?: string;
    country?: string;
    trackId?: number; // OxaPay Track ID
}

export interface SupportTicket {
    id: string;
    user: string;
    email: string; // Added email for contact
    subject: string;
    message: string;
    status: "open" | "pending" | "closed";
    priority: "low" | "medium" | "high";
    date: string;
    messages: {
        sender: "user" | "admin";
        text: string;
        time: string;
    }[];
}

export interface Visit {
    id: string;
    path: string;
    date: string;
    ip?: string;
}

export interface Review {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
}

export interface Data {
    profile: Profile;
    products: Product[];
    categories: Category[];
    orders: Order[];
    tickets: SupportTicket[];
    visits: Visit[];
    reviews: Review[];
}

export async function getData(): Promise<Data> {
    let fileContent = "";
    try {
        fileContent = await fs.readFile(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        // Ensure visits array exists for older data files
        if (!data.visits) data.visits = [];
        return data;
    } catch (error: any) {
        // If file doesn't exist, return default structure
        if (error.code === 'ENOENT') {
            return getDefaultData();
        }

        // Handle Data Corruption (SyntaxError)
        if (error instanceof SyntaxError) {
            console.error("CRITICAL: Database file is corrupted. Backing up and resetting.", error);
            // Backup corrupted file
            await fs.writeFile(`${dataFilePath}.corrupt.${Date.now()}`, fileContent || "");
            // Return defaults to keep app running
            return getDefaultData();
        }

        // Log other errors and THROW
        console.error("CRITICAL: Error reading database file:", error);
        await fs.writeFile('error.log', `${new Date().toISOString()} - CRITICAL: Error reading data: ${error}\n`, { flag: 'a' });
        throw error;
    }
}

const baseDataPath = path.join(process.cwd(), 'src/data.base.json');

// @ts-ignore
import defaultData from './data.default.json';

function getDefaultData(): Data {
    try {
        // SYNCHRONOUSLY check for runtime base file to avoid async changes to this function signature
        if (fsSync.existsSync(baseDataPath)) {
            const baseContent = fsSync.readFileSync(baseDataPath, 'utf-8');
            return JSON.parse(baseContent) as Data;
        }
        return JSON.parse(JSON.stringify(defaultData)) as Data;
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultData)) as Data;
    }
}

export async function saveData(data: Data): Promise<void> {
    const tmpPath = `${dataFilePath}.tmp`;
    try {
        // Write to temporary file first
        await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
        // Atomic rename (overwrites dataFilePath)
        await fs.rename(tmpPath, dataFilePath);
    } catch (error) {
        console.error("CRITICAL: Error saving database file:", error);
        // Clean up tmp file if it exists
        try { await fs.unlink(tmpPath); } catch { }
        throw error;
    }
}

export async function resetData(): Promise<void> {
    let dataToRestore: Data;

    try {
        // Try to read runtime base file
        const baseContent = await fs.readFile(baseDataPath, 'utf-8');
        dataToRestore = JSON.parse(baseContent);
        console.log("[DB] Restoring from data.base.json (Admin Saved Configuration)");
    } catch (error) {
        console.log("[DB] Restoring from data.default.json (System Default)");
        dataToRestore = getDefaultData();
    }

    await saveData(dataToRestore);
}

export async function saveCurrentAsDefault(): Promise<void> {
    const currentData = await getData();

    // Create a clean "base" state
    const baseData: Data = {
        profile: {
            ...currentData.profile,
            salesCount: 0, // Reset stats
            productsCount: currentData.products.length // Update product count
        },
        products: currentData.products,
        categories: currentData.categories,
        orders: [],
        tickets: [],
        visits: [],
        reviews: []
    };

    await fs.writeFile(baseDataPath, JSON.stringify(baseData, null, 2), 'utf-8');
    console.log("[DB] Internal Restore Point Saved to data.base.json");
}
