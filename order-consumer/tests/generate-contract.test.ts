import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import { Pact, SpecificationVersion } from '@pact-foundation/pact';
import { integer, like, regex, string } from '@pact-foundation/pact/src/v3/matchers.js';
import { AddressServiceClient } from '../src/address-service-client.js';

describe('Address service', () => {

    const pact = new Pact({
        consumer: 'order-consumer',
        provider: 'address-provider',
        spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
        dir: 'order-consumer/pacts',
        logLevel: 'info',
    });

    test('allows to get an address by ID', async () => {

        const addressId = uuidv4();
        await pact
        .addInteraction()
        .given('an address with ID {addressId} exists', { addressId: addressId })
        .uponReceiving(`a GET request for address ${addressId}`)
        .withRequest('GET', `/address/${addressId}`, (builder) => {
            builder.headers({ Accept: 'application/json' });
        })
        .willRespondWith(200, (builder) => {
            builder.headers({ 'Content-Type': 'application/json' });
            /**
             * TODO: Add three fields to the expected response:
             * - One field zipCode, which is expected to have an integer value
             * - Another field state, which is expected to have a string value
             * - Yet another field country, which is expected only to have a
             *   value 'United States' or 'Canada'
             * 
             * You can think up suitable example values yourself.
             */
            builder.jsonBody(
                like({
                    id: addressId,
                    addressType: string('delivery'),
                    street: string('Rodeo Drive'),
                    houseNumber: integer(555),
                    city: string('Schenectady')
                })
            );
        })
        .executeTest(async (mockserver) => {
            const client = new AddressServiceClient(mockserver.url);
            const address = await client.getAddress(addressId);
            expect(address.id).toBe(addressId);
            /**
             * TODO: Add assertions that make sure that the mock provider
             * returns the fields and example values that you specified above.
             */
        });
    });

    test('returns a 404 when address is not found', async () => {

        /**
         * TODO: Implement this test by completing the following steps:
         * - Define the pact, including a parameterized provider state
         *     'an address with ID {addressId} does not exist'
         * - Specify the request and expect the provider to return an HTTP 404.
         *     You don't need to add any other expectations.
         * - Run the test by calling the mock server using the getAddress()
         *     operation defined in the AddressServiceClient.
         */
    });

    test('returns a 204 when an address is deleted', async () => {

        /**
         * TODO: Implement this test by completing the following steps:
         * - Define the pact, including a parameterized provider state
         *     'no specific state required'
         * - Specify the request and expect the provider to return an HTTP 204.
         *     You don't need to add any other expectations.
         * - Run the test by calling the mock server using the deleteAddress()
         *     operation defined in the AddressServiceClient.
         */
    });
});
