import {BTC_BITCOIN} from "@/constant/hardcoreValue";

export let state = {
	btcPrice: null,
}

export async function getBTCPrice() {
    let res = await JSON.parse(JSON.stringify(BTC_BITCOIN));
    state.btcPrice = res.quotes.USD.price;
    return res.quotes.USD.price
}