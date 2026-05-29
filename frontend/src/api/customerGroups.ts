import type { CustomerGroup } from "@/types";
import { sleep } from "@/utils/sleep";

const BASE = "http://localhost:4000";

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  await sleep(500);
  const res = await fetch(`${BASE}/api/customer-groups`);
  if (!res.ok) throw new Error("Failed to fetch customer groups");
  return res.json() as Promise<CustomerGroup[]>;
}
