import { Server } from "node:http";
import { afterAll, beforeAll, describe, test } from "vitest";
import { addAddress, createApp, removeAddress } from "../src/provider";
import { Verifier } from "@pact-foundation/pact";
import { Address } from "../src/address";

describe('Verify contracts', () => {

    let server: Server;
    let port: number = 9876;

    beforeAll(() => {
        server = createApp().listen(port);
    });

    test('to see if provider implementation matches consumer expectations', () => {

        new Verifier({
            providerBaseUrl: `http://localhost:${port}`,
            provider: 'address-provider',
            providerVersion: '1.0.0',
            pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
            pactBrokerToken: process.env.PACT_BROKER_TOKEN,
            publishVerificationResult: true,
            consumerVersionSelectors: [
                { branch: "main" }
            ],
            stateHandlers: {
                'no specific state required': async () => {},
                'an address with ID {addressId} exists': async (_: string, params?: { [name: string]: string }) => {
                    const addressId = params?.['addressId'];

                    if (!addressId) throw new Error('addressId param is required');

                    const address: Address = {
                        id: addressId,
                        addressType: 'billing',
                        street: 'Wall Street',
                        houseNumber: 1,
                        city: 'New York',
                        zipCode: 10005,
                        state: 'New York',
                        country: 'United States'
                    } 
                    addAddress(address);
                },
                'an address with ID {addressId} does not exist': async (_: string, params?: { [name: string]: string }) => {
                    const addressId = params?.['addressId'];

                    if (!addressId) throw new Error('addressId param is required');
                    
                    removeAddress(addressId);
                },
            },
            logLevel: 'debug'
        }).verifyProvider(),
        30_000
    });

    afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));
});