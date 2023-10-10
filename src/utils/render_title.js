import figlet from "figlet";

export default function renderTitle() {
  const text = figlet.textSync("My Node.js App", {
    font: "Small",
  });
  console.log(`\n${text}\n`);
}
