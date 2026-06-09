import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test } from 'vitest';
import { Pact, SpecificationVersion } from '@pact-foundation/pact';
import { integer, like, regex, string } from '@pact-foundation/pact/src/v3/matchers.js';
import { PaymentServiceClient } from '../src/payment-service-client.js';

describe('Payment service', () => {

    const pact = new Pact({
        consumer: 'order-consumer',
        provider: 'payment-provider',
        spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
        dir: 'order-consumer/pacts',
        logLevel: 'info',
    });

    test('allows to get payment details for an order by ID', async () => {

        const orderId = uuidv4();
        await pact
        .addInteraction()
        .given('payment details for an order with ID {addressId} exist', { orderId: orderId })
        .uponReceiving(`a GET request for payment details for order ${orderId}`)
        .withRequest('GET', `/order/${orderId}/payment`, (builder) => {
            builder.headers({ Accept: 'application/json' });
        })
        .willRespondWith(200, (builder) => {
            builder.headers({ 'Content-Type': 'application/json' });
            builder.jsonBody(
                like({
                    id: string('some-payment-id'),
                    orderId: orderId,
                    amount: integer(99),
                    status: regex('open|paid|rejected', 'open')
                })
            );
        })
        .executeTest(async (mockserver) => {
            const client = new PaymentServiceClient(mockserver.url);
            const order = await client.getPaymentForOrder(orderId);
            expect(order.orderId).toBe(orderId);
        });
    });

    test('returns a 404 when no payment details are found for order', async () => {

        const orderId = uuidv4();
            await pact
            .addInteraction()
            .given('payment details for an order with ID {addressId} do not exist', { orderId: orderId })
            .uponReceiving(`a GET request for payment details for order ${orderId}`)
            .withRequest('GET', `/order/${orderId}/payment`, (builder) => {
                builder.headers({ Accept: 'application/json' });
            })
            .willRespondWith(404)
            .executeTest(async (mockserver) => {
                const client = new PaymentServiceClient(mockserver.url);
                await client.getPaymentForOrder(orderId);
            });
    });
});
