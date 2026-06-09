import axios, { type AxiosResponse } from 'axios';
import { Payment } from './payment';

export class PaymentServiceClient {

  constructor(private readonly baseUrl: string) {}

  async getPaymentForOrder(id: string): Promise<Payment> {
    const { data }: AxiosResponse<Payment> = await axios.get(`${this.baseUrl}/order/${id}/payment`, {
      headers: { Accept: 'application/json' },
      validateStatus(status) {
        return true;  // this prevents Axios from throwing an error when the status code isn't 2xx
      },
    });
    return data;
  }
}