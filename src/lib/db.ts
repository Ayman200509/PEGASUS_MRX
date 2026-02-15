import fs from 'fs/promises';
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

function getDefaultData(): Data {
    return {
        profile: {
            name: "PEGASUS_MRX",
            handle: "@PEGASUS_MRX",
            type: "DIGITAL STORE",
            tagline: "Digital Store",
            avatar: "",
            socials: {
                telegram: "@PEGASUS_MRX",
                twitter: "",
                instagram: "",
                discord: "",
                youtube: "",
                website: ""
            },
            payout: {
                network: "USDT (TRC-20)",
                address: ""
            },
            telegramWidget: {
                enabled: true,
                username: "PEGASUS_MRX"
            },
            productsCount: 0,
            salesCount: 0
        },
        products: [],
        categories: [],
        orders: [],
        tickets: [],
        visits: [],
        reviews: []
    };
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
