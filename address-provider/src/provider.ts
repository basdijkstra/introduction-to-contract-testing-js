import express, { type Express } from 'express';
import { Address } from "./address";

const addresses = new Map<string, Address>();

export function createApp(): Express {

    const app = express();

    app.use(express.json());

    app.get('/address/:id', (req, res) => {
        const address = addresses.get(req.params.id);
        address ? res.json(address) : res.status(404).json({ error: 'Address not found' });
    });

    app.delete('/address/:id', (req, res) => {
        addresses.delete(req.params.id);
        res.status(204);
    });

    return app;
}

export function addAddress(address: Address): void {
    addresses.set(address.id, address);
}

export function removeAddress(id: string): void {
    addresses.delete(id);
}