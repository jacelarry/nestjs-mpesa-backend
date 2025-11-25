export interface Bundle {
  id: number;
  name: string;
  price: number;
  dataAmount: number; // in MB
  validity: number; // in days
  ussdCode: string;
}

export const bundles: Bundle[] = [
  { id: 1, name: 'Daily 100MB', price: 20, dataAmount: 100, validity: 1, ussdCode: '*544*1#' },
  { id: 2, name: 'Weekly 350MB', price: 50, dataAmount: 350, validity: 7, ussdCode: '*544*2#' },
  { id: 3, name: 'Monthly 2GB', price: 250, dataAmount: 2000, validity: 30, ussdCode: '*544*3#' },
  // Add more bundles as needed
];
