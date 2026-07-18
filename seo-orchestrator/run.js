import { execSync } from "child_process";
import { optimizeEvent } from "./seo_writer.js";

function webcmd(cmd) {
  return JSON.parse(execSync(`webcmd ${cmd} -f json`).toString());
}

async function main() {
  const eventInput = {
    rawIdea: "a casual founders meetup for early-stage AI startups",
    city: "Bengaluru",
    date: "Aug 1, 2026",
    themeKeyword: "AI founders bengaluru meetup"
  };

  console.log("→ Writing SEO-optimized copy...");
  const copy = await optimizeEvent(eventInput);
  console.log(copy);

  const events = webcmd("luma events list");
  const draft = events.find(e => e.status === "draft");

  console.log("→ Updating event with optimized copy...");
  execSync(`webcmd luma event update ${draft.id} --title "${copy.title}" --description "${copy.description}" --tags "${copy.tags.join(",")}"`);

  console.log("→ Publishing...");
  execSync(`webcmd luma event publish ${draft.id}`);

  console.log("→ Checking for pending guests to approve...");
  const guests = webcmd(`luma guests list ${draft.id}`);
  for (const g of guests.filter(g => g.status === "pending")) {
    execSync(`webcmd luma guests approve ${draft.id} ${g.guest_id}`);
    console.log(`  approved ${g.name}`);
  }

  console.log("✅ Done. Event is live and guests are approved.");
}

main();