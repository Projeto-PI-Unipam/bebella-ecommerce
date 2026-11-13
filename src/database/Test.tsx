import { ObjectId } from "bson";
import type { ClothesModel, size, WebSale } from "./Schema.tsx";
import { sizes } from "./Schema.tsx";

export const test_sales: WebSale[] = [
  {
    _id: new ObjectId(),
    date: new Date(),
    amount: 0,
    address: {
      city: "Patos de Minas",
      cost: 19.9,
      phone: 34998752310,
      state: "MG",
      number: 130,
      street: "Rua João Gabriel Ferreira",
      receiver: "Alexandre",
      zip_code: 38700054,
      complement: "Ap 301",
    },
    status: "Concluído",
    buyer_id: new ObjectId("6acae40fc498ef2b2d81cd27"),
    payment: "Pix",
    installments: 1,
    products: [
      {
        amount: 4,
        item: {
          _id: new ObjectId("6aa3ffc4f9fcba8d5f023131"),
          name: "Vestido de Malha",
          brand: "FARM RIO",
          category: "Vestidos",
          size_data: ["P", "M", "G"],
          description:
            "Vestido de Malha da FARM RIO©, muito confortável e estiloso, perfeito para o verão!",
          in_stock: 8,
          price: 329.99,
          dimensions: [20, 10, 45],
          weight: 0.2,
          db_id: "6aa3ffc4f9fcba8d5f023131",
          pic_url: [`/src/assets/img/teste2.png`],
        },
        size: "M",
      },
      {
        amount: 3,
        item: {
          _id: new ObjectId("6aa3ffc4f9fcba8d5f023131"),
          name: "Vestido de Malha",
          brand: "FARM RIO",
          category: "Vestidos",
          size_data: ["P", "M", "G"],
          description:
            "Vestido de Malha da FARM RIO©, muito confortável e estiloso, perfeito para o verão!",
          in_stock: 8,
          price: 329.99,
          dimensions: [20, 10, 45],
          weight: 0.2,
          db_id: "6aa3ffc4f9fcba8d5f023131",
          pic_url: [`/src/assets/img/teste2.png`],
        },
        size: "M",
      },
    ],
  },
  {
    _id: new ObjectId(),
    date: new Date(),
    amount: 0,
    address: {
      city: "Patos de Minas",
      cost: 19.9,
      phone: 34998752310,
      state: "MG",
      number: 130,
      street: "Rua João Gabriel Ferreira",
      receiver: "Alexandre",
      zip_code: 38700054,
      complement: "Ap 301",
    },
    status: "Concluído",
    buyer_id: new ObjectId("6acae40fc498ef2b2d81cd27"),
    payment: "Pix",
    installments: 1,
    products: [
      {
        amount: 4,
        item: {
          _id: new ObjectId("6aa3ffc4f9fcba8d5f023131"),
          name: "Vestido de Malha",
          brand: "FARM RIO",
          category: "Vestidos",
          size_data: ["P", "M", "G"],
          description:
            "Vestido de Malha da FARM RIO©, muito confortável e estiloso, perfeito para o verão!",
          in_stock: 8,
          price: 329.99,
          dimensions: [20, 10, 45],
          weight: 0.2,
          db_id: "6aa3ffc4f9fcba8d5f023131",
          pic_url: [`/src/assets/img/teste2.png`],
        },
        size: "M",
      },
    ],
  },
];

export const test_p1: ClothesModel = {
  id: new ObjectId(),
  db_id: new ObjectId().toString(),
  name: "Roupa Teste",
  brand: "Marca Proto",
  category: "Categoria Zero",
  size_data: (sizes as size[]).concat([40, 42] as size[]),
  description: "Produto para testar a pesquisa do site",
  in_stock: 3,
  pic_url: [
    "https://farmrio.com/cdn/shop/files/SPRING_02_EC_R_C.jpg?format=pjpg&v=1788898867&width=640",
    "https://farmrio.com/cdn/shop/files/farm-rio-borbofly-long-sleeve-maxi-dress_361238_1.jpg?format=pjpg&v=1787878453&width=640",
  ],
  price: 200.5,
  dimensions: [40, 10, 30],
  weight: 0.25,
};

export const test_p2: ClothesModel = {
  _id: new ObjectId(),
  db_id: new ObjectId().toString(),
  name: "Segundo Teste",
  brand: "Topíssimo",
  category: "Incrível",
  size_data: (sizes as size[]).concat([40, 42] as size[]),
  description: "Produto para testar a pesquisa do site, de novo!",
  in_stock: 3,
  pic_url: [
    "https://farmrio.com/cdn/shop/files/farm-rio-borbofly-long-sleeve-maxi-dress_361238_1.jpg?format=pjpg&v=1787878453&width=640",
    "https://farmrio.com/cdn/shop/files/SPRING_02_EC_R_C.jpg?format=pjpg&v=1788898867&width=640",
  ],
  price: 120,
  dimensions: [20, 40, 70],
  weight: 0.1,
};
