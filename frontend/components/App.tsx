"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { Shell18, Brand } from "./shells";
import { DefiPanel } from "./DefiPanel";
const CONTRACT = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0") as `0x${string}`;
const abi = [
  { name: "create", type: "function", stateMutability: "nonpayable", inputs: [{ name: "item", type: "string" }, { name: "minBid", type: "uint256" }, { name: "durationDays", type: "uint256" }], outputs: [{ type: "uint256" }] },,  { name: "bid", type: "function", stateMutability: "payable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },,  { name: "settle", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },,  { name: "get", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "tuple", components: [{ name: "seller", type: "address" }, { name: "item", type: "string" }, { name: "minBid", type: "uint256" }, { name: "highBid", type: "uint256" }, { name: "highBidder", type: "address" }, { name: "endsAt", type: "uint256" }, { name: "settled", type: "bool" }] }] },,  { name: "total", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
const cut = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtUsd = (w?: bigint) => w === undefined ? "0.00" : Number(formatEther(w)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brand: Brand = { name: "Arc Procure", sub: "Sell to the top", emoji: "📦", color: "teal", font: '"Franklin Gothic Medium","Arial Narrow",sans-serif', shape: "rounded-full", hero: "Bid & win", herosub: "On-chain liquidity and yield, included." };
function Tile({ id, me, pending, send }: { id: bigint; me?: string; pending: boolean; send: (fn: string, args: any[], v?: bigint) => void }) {
  const { data: it } = useReadContract({ address: CONTRACT, abi, functionName: "get", args: [id] });
  const [amt, setAmt] = useState("");
  if (!it) return null;
  const done = it.settled;
  return (
    <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-4 space-y-2 hover:border-teal-500/40 transition-colors">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-teal-500/15 grid place-items-center text-lg shrink-0">📦</div>
        <div className="flex-1 min-w-0"><div className="font-bold text-[color:var(--txt)]">${fmtUsd(it.highBid)}</div><div className="text-[11px] text-[color:var(--mut)] truncate">{it.item || `#${id}`}</div></div>
        <span className="text-[11px] bg-[var(--ipt)] px-2 py-1 rounded-full shrink-0">{done ? "Done ✓" : "Open"}</span></div>
      {!done && <div className="flex flex-wrap items-center gap-2"><div className="flex gap-2 pt-1"><div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mut)] text-xs">$</span><input value={amt} onChange={e=>setAmt(e.target.value)} type="number" placeholder="0.00" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] pl-6 pr-2 py-1.5 text-xs focus:outline-none" /></div><button onClick={()=>send("bid",[id],parseEther(amt||"0"))} disabled={pending||!(Number(amt)>0)} className="px-3 py-1.5 bg-teal-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-40 text-xs">{pending?"…":"Bid"}</button></div><button onClick={()=>send("settle",[id])} disabled={pending} className="px-2.5 py-1.5 bg-[var(--btn2)] text-[color:var(--txt)] rounded-lg hover:bg-gray-600 disabled:opacity-40 text-xs">{pending?"…":"Settle"}</button></div>}
    </div>
  );
}
export default function App() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState("home");
  const [f, setF] = useState<any>({item:"",min:"",dur:""});
  const { data: count } = useReadContract({ address: CONTRACT, abi, functionName: "total" });
  const { writeContract, data: tx, isPending, reset } = useWriteContract();
  const { isSuccess, isLoading: cfm } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  useEffect(() => { if (isSuccess) { reset(); setF({item:"",min:"",dur:""}); } }, [isSuccess]); // eslint-disable-line
  const pending = isPending || cfm;
  const n = count !== undefined ? Number(count) : 0;
  const send = (fn: string, args: any[], v?: bigint) => writeContract({ address: CONTRACT, abi, functionName: fn as any, args, value: v });
  return (<Shell18 brand={brand} tabs={[["pool", "Market"], ["home", "Lots"], ["swap", "Exchange"]]} tab={tab} setTab={setTab}>
    {tab === "home" && <div className="space-y-4">
      <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-6 space-y-3">
        <input value={f.item} onChange={e=>setF(v=>({...v,item:e.target.value}))} placeholder="Item" type="text" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
        <input value={f.min} onChange={e=>setF(v=>({...v,min:e.target.value}))} placeholder="Min bid" type="number" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
        <input value={f.dur} onChange={e=>setF(v=>({...v,dur:e.target.value}))} placeholder="Days" type="number" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
        
        <button onClick={() => send("create", [f.item, parseEther(f.min||"0"), BigInt(f.dur||"0")])} disabled={!isConnected || pending || (false)} className="w-full py-3 font-bold rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:opacity-90 disabled:opacity-40">{pending ? "…" : "Open lot 📦"}</button>
      </div>
      {n > 0 ? <div className="space-y-3">{Array.from({ length: n }, (_, i) => BigInt(n - 1 - i)).map(id => <Tile key={id.toString()} id={id} me={address} pending={pending} send={send} />)}</div> : <div className="text-center text-sm text-[color:var(--mut)] py-8">Nothing yet 📦</div>}
    </div>}
    {tab === "pool" && <DefiPanel color="teal" show={["pool"]} note="Constant-product pool · 0.3% fee · native USDC↔EURC on Arc." />}
    {tab === "swap" && <DefiPanel color="teal" show={["swap"]} note="Constant-product pool · 0.3% fee · native USDC↔EURC on Arc." />}
  </Shell18>);
}