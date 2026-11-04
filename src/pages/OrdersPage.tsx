import { ObjectId } from "bson";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { type SaleReview, to_currency, type WebSale } from "../database/Schema";

export default function OrdersPage({ host }: { host?: string }) {
	const [orders, setOrders] = useState<Array<WebSale> | null>(null);
	const [selectedOrder, selectOrder] = useState<WebSale | null>(null);
	useEffect(() => {
		async function getOrders() {
			const test: WebSale[] = [
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
			setOrders(test);
			/* const res = await fetch("/userapi/getorders", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: new URLSearchParams({
          token: host,
        }),
      });
      if (res.ok) {
        const prods: Array<WebSale> = await res.json();
        setOrders(prods);
      } else {
        console.error(await res.json());
        console.error(res);
      } */
		}
		getOrders();
	}, [location.pathname, host]);
	return (
		<div className="h-[85dvh] w-full lg:pl-[8dvw] lg:pr-[8dvw] lg:pt-[4dvh] lg:pb-[4dvh] flex flex-row justify-evenly overflow-x-hidden">
			<div className="flex flex-col overflow-y-scroll overflow-x-hidden gap-4">
				{orders?.map((order, index) => (
					<div
						key={order.date ? order.date.valueOf() : index}
						className="lg:w-132 ml-8 lg:h-52 lg:min-h-52 min-h-40 h-40 lg:mr-12 bg-sky-100 flex flex-row items-center cursor-pointer transition hover:scale-102 duration-120 ease-out hover:bg-sky-200 rounded-2xl"
						onClick={() =>
							selectedOrder === order ? selectOrder(null) : selectOrder(order)
						}
					>
						<div
							className={clsx(
								"bg-rose-200 h-full w-32 flex flex-col rounded-l-2xl",
							)}
						>
							<span className="font-[Prompt] text-lg text-neutral-800 mt-4">
								{"Pedido"}
							</span>
							<span className="font-[Prompt] text-md text-neutral-800">
								{`#${order._id!.toString().slice(0, 10)}`}
							</span>
							<span className="font-[Prompt] text-lg text-neutral-800 mt-25">
								{to_currency(
									order.products.reduce(
										(acc, elem) => acc + elem.amount * elem.item.price,
										0,
									),
								)}
							</span>
						</div>
						<div className="w-full h-full flex flex-col"></div>
					</div>
				))}
			</div>
			{selectedOrder && (
				<div
					className={clsx(
						"flex flex-col h-full w-3/5 bg-[#ffe5e5] rounded-2xl items-start justify-start pt-4 pb-4 pl-8 pr-8 overflow-scroll",
					)}
				>
					<span className="font-[Prompt] text-lg text-neutral-800">
						{"Endereço:"}
					</span>
					<span className="ml-4 font-[Prompt] text-md text-neutral-600">{`${selectedOrder.address.street} ${selectedOrder.address.number}, ${selectedOrder.address.city} - ${selectedOrder.address.state}`}</span>
					<span className="font-[Prompt] text-lg text-neutral-800 mt-4">
						{"Valor Total:"}
					</span>
					<span className="font-[Prompt] text-lg text-neutral-800 ml-4">
						{`${to_currency(selectedOrder.products.reduce((acc, elem) => acc + elem.amount * elem.item.price, 0) + (selectedOrder.address.cost || 0))} (Total da Compra: ${to_currency(selectedOrder.products.reduce((acc, elem) => acc + elem.amount * elem.item.price, 0))}, Frete: ${to_currency(selectedOrder.address.cost || 0)})`}
					</span>
					<span className="font-[Prompt] text-lg text-neutral-800 mt-4 mb-4">
						{"Produtos:"}
					</span>
					<div className="grid grid-cols-2 grid-flow-col-dense h-full w-full gap-x-4 gap-y-8">
						{selectedOrder.products.map((prod, index) => (
							<div
								key={prod.item.db_id}
								className="h-32 w-full rounded-lg bg-neutral-100 flex flex-row"
							>
								<img
									alt="product-example"
									src={prod.item.pic_url[0]}
									className="h-32 w-32 aspect-square"
								/>
								<div className="w-full h-full flex flex-col items-start px-4">
									<span className="font-[Prompt] text-lg text-neutral-800">
										{`${prod.item.name} (${prod.size})`}
									</span>
									<span className="font-[Prompt] mt-1 text-sm text-neutral-600">{`Quantidade: ${prod.amount}`}</span>
									<span className="font-[Prompt] text-sm text-neutral-600">{`Valor Unitário: ${prod.item.price}`}</span>
									<span className="font-[Prompt] text-base text-neutral-800 self-end mt-7 ml-2">{`Valor Total: ${to_currency(prod.amount * prod.item.price)}`}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
