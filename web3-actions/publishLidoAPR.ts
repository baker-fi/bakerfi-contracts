import {
	ActionFn,
	Context,
	Event,
	TransactionEvent,
} from '@tenderly/actions';
import Lido from "./abi/Lido.json";
import { ethers } from "ethers";

export const lidoAPR: ActionFn = async (context: Context, event: Event) => {
	let txEvent = event as TransactionEvent;
	let iface = new ethers.utils.Interface(Lido);	

	const lidoContract = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
	const eventFilter = "0xff08c3ef606d198e316ef5b822193c489965899eb4e3c248cea1a4626c3eda50"

	const [log] = txEvent.logs.filter((logEvent) => 
		logEvent.address.toLowerCase()  === lidoContract.toLowerCase() && 
		logEvent.topics[0].toLowerCase() === eventFilter.toLowerCase()
	)
	const result = iface.decodeEventLog(
        "TokenRebased",
        log.data,
		log.topics
    );
	
	const secondsInYear = 60 * 60 * 24 * 365;

	const { 
		timeElapsed, 
		preTotalShares ,
		preTotalEther,
		postTotalShares,
		postTotalEther,
	} = result;

	const preShareRate = preTotalEther * 1e27 / preTotalShares;
	const postShareRate = postTotalEther * 1e27 / postTotalShares;

	const userAPR =
    	secondsInYear * (
        (postShareRate - preShareRate) / preShareRate
    ) / timeElapsed

	console.log("Lido APR ", userAPR);
}
