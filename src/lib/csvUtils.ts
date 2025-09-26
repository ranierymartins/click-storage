// Funções utilitárias para salvar e ler clientes e produtos permanentemente
import { Customer, Product } from '../types';

// Salva clientes permanentemente no localStorage
export function saveCustomersToStorage(customers: Customer[]) {
  localStorage.setItem('clientes', JSON.stringify(customers));
}

export function loadCustomersFromStorage(): Customer[] {
  const data = localStorage.getItem('clientes');
  return data ? JSON.parse(data) : [];
}

// Salva produtos permanentemente no localStorage
export function saveProductsToStorage(products: Product[]) {
  localStorage.setItem('produtos', JSON.stringify(products));
}

export function loadProductsFromStorage(): Product[] {
  const data = localStorage.getItem('produtos');
  return data ? JSON.parse(data) : [];
}

// Função para converter clientes em CSV (caso queira exportar manualmente)
export function customersToCSV(customers: Customer[]): string {
  const header = 'id,name,email,phone,address,createdAt';
  const rows = customers.map(c => `${c.id},${c.name},${c.email},${c.phone},${c.address},${c.createdAt}`);
  return [header, ...rows].join('\n');
}

export function productsToCSV(products: Product[]): string {
  const header = 'id,name,description,price,stock,category,brand,serialNumbers,createdAt';
  const rows = products.map(p => {
    const serials = (p.serialNumbers || []).join(';');
    const brand = p.brand || '';
    return `${p.id},${p.name},${p.description},${p.price},${p.stock},${p.category},${brand},${serials},${p.createdAt}`;
  });
  return [header, ...rows].join('\n');
}

export function parseCSV(csv: string) {
  const [header, ...lines] = csv.split('\n');
  const keys = header.split(',');
  return lines.map(line => {
    const values = line.split(',');
    return keys.reduce((obj, key, i) => {
      obj[key] = values[i];
      return obj;
    }, {} as any);
  });
}
