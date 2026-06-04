import axios, { type AxiosResponse } from 'axios';
import { Address } from "./address";

export class AddressServiceClient {

  constructor(private readonly baseUrl: string) {}

  async getAddress(id: string): Promise<Address> {
    const { data }: AxiosResponse<Address> = await axios.get(`${this.baseUrl}/address/${id}`, {
      headers: { Accept: 'application/json' },
      validateStatus(status) {
        return true;  // this prevents Axios from throwing an error when the status code isn't 2xx
      },
    });
    return data;
  }

  async deleteAddress(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/address/${id}`);
  }
}