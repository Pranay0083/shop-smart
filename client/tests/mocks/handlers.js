import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Mock Product 1', price: 10 },
      { id: 2, name: 'Mock Product 2', price: 20 },
    ]);
  }),
];