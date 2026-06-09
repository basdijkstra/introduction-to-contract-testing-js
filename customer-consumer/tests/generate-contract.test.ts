import { describe, expect, test } from 'vitest';
import { Pact, SpecificationVersion } from '@pact-foundation/pact';
import { integer, like, regex, string } from '@pact-foundation/pact/src/v3/matchers.js';
import { AddressServiceClient } from '../src/address-service-client.js';

describe('Address service', () => {

    const pact = new Pact({
        consumer: 'customer-consumer',
        provider: 'address-provider',
        spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
        dir: 'customer-consumer/pacts',
        logLevel: 'info',
    });

    test('allows to get an address by ID', async () => {

        const addressId = 'address-123';
        await pact
        .addInteraction()
        .given('an address with ID {addressId} exists', { addressId: addressId })
        .uponReceiving(`a GET request for address ${addressId}`)
        .withRequest('GET', `/address/${addressId}`, (builder) => {
            builder.headers({ Accept: 'application/json' });
        })
        .willRespondWith(200, (builder) => {
            builder.headers({ 'Content-Type': 'application/json' });
            builder.jsonBody(
                like({
                    id: addressId,
                    addressType: string('billing'),
                    street: string('Sesame Street'),
                    houseNumber: integer(123),
                    city: string('Beverly Hills'),
                    zipCode: integer(90210),
                    state: string('California'),
                    country: regex('United States|Canada', 'United States')
                })
            );
        })
        .executeTest(async (mockserver) => {
            const client = new AddressServiceClient(mockserver.url);
            const address = await client.getAddress(addressId);
            // These assertions run against the mock's example values.
            expect(address.id).toBe(addressId);
            expect(address.addressType).toBe('billing');
        });
    });

    test('returns a 404 when address is not found', async () => {

        const addressId = 'address-789';
        await pact
        .addInteraction()
        .given('an address with ID {addressId} does not exist', { addressId: addressId })
        .uponReceiving(`a GET request for address ${addressId}`)
        .withRequest('GET', `/address/${addressId}`, (builder) => {
            builder.headers({ Accept: 'application/json' });
        })
        .willRespondWith(404)
        .executeTest(async (mockserver) => {
            const client = new AddressServiceClient(mockserver.url);
            await client.getAddress(addressId);
        });
    });

    test('returns a 204 when an address is deleted', async () => {

        const addressId = 'address-456';
        await pact
        .addInteraction()
        .given('no specific state required')
        .uponReceiving(`a DELETE request for address ${addressId}`)
        .withRequest('DELETE', `/address/${addressId}`)
        .willRespondWith(204)
        .executeTest(async (mockserver) => {
            const client = new AddressServiceClient(mockserver.url);
            await client.deleteAddress(addressId);
        });
    });
});
