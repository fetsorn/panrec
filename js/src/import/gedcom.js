import { ReadableStream } from "node:stream/web";
import fs from "fs";
import {
  GEDCStruct,
  g7ConfGEDC,
  G7Lookups,
  G7Dataset,
  g7validation,
} from "@fetsorn/js-gedcom";

function namePerson(indi) {
  const [name] = indi.sub.get("https://gedcom.io/terms/v7/INDI-NAME") ?? [];

  const [uid] = indi.sub.get("https://gedcom.io/terms/v7/UID") ?? [];

  const initialsPartial = name
    ? [
        name.payload
          .split("/")
          .map((initial) => initial.trim())
          .map((initial) => initial.split(" "))
          .flat()
          .map((initial) => initial.trim())
          .filter((initial) => initial !== "")
          .join("_"),
      ]
    : [];

  const uidPartial = uid ? [uid.payload] : [];

  const person = [...initialsPartial, ...uidPartial].join("_");

  return person;
}

function buildParents(indi) {
  const parentFamilies =
    indi.sub.get("https://gedcom.io/terms/v7/INDI-FAMC") ?? [];

  const parents = parentFamilies.reduce((acc, familyParent) => {
    const [husband] =
      familyParent.payload.sub.get("https://gedcom.io/terms/v7/FAM-HUSB") ?? [];

    const husbandPartial = husband ? [namePerson(husband.payload)] : [];

    const [wife] =
      familyParent.payload.sub.get("https://gedcom.io/terms/v7/FAM-WIFE") ?? [];

    const wifePartial = wife ? [namePerson(wife.payload)] : [];

    const children =
      familyParent.payload.sub.get("https://gedcom.io/terms/v7/CHIL") ?? [];

    const [marriage] =
      familyParent.payload.sub.get("https://gedcom.io/terms/v7/MARR") ?? [];

    const [uid] =
      familyParent.payload.sub.get("https://gedcom.io/terms/v7/UID") ?? [];

    return [...husbandPartial, ...wifePartial, ...acc];
  }, []);

  return parents;
}

function renderMonth(month) {
  switch (month) {
    case "https://gedcom.io/terms/v7/month-JAN":
      return "01";
    case "https://gedcom.io/terms/v7/month-FEB":
      return "02";
    case "https://gedcom.io/terms/v7/month-MAR":
      return "03";
    case "https://gedcom.io/terms/v7/month-APR":
      return "04";
    case "https://gedcom.io/terms/v7/month-MAY":
      return "05";
    case "https://gedcom.io/terms/v7/month-JUN":
      return "06";
    case "https://gedcom.io/terms/v7/month-JUL":
      return "07";
    case "https://gedcom.io/terms/v7/month-AUG":
      return "08";
    case "https://gedcom.io/terms/v7/month-SEP":
      return "09";
    case "https://gedcom.io/terms/v7/month-OCT":
      return "10";
    case "https://gedcom.io/terms/v7/month-NOV":
      return "11";
    case "https://gedcom.io/terms/v7/month-DEC":
      return "12";
    default:
      return undefined;
  }
}

function renderDate({ year, month, day }) {
  const yearPartial = year ?? undefined;

  const monthPartial = month ? renderMonth(month) : undefined;

  const dayPartial = day ? day.toString().padStart(2, "0") : undefined;

  const date = [yearPartial, monthPartial, dayPartial]
    .filter(Boolean)
    .join("-");

  return date;
}

// TODO add event uuid
function buildBirth(person, indi) {
  const [birth] = indi.sub.get("https://gedcom.io/terms/v7/BIRT") ?? [];

  if (birth) {
    const [place] = birth.sub.get("https://gedcom.io/terms/v7/PLAC") ?? [];

    const placePartial = place ? { datum: place.payload.join(",") } : {};

    const [date] = birth.sub.get("https://gedcom.io/terms/v7/DATE") ?? [];

    const datePartial =
      date && date.payload.date
        ? { actdate: renderDate(date.payload.date) }
        : {};

    const uuid = crypto.randomUUID();

    const event = date
      ? {
          _: "event",
          event: uuid,
          actname: person,
          category: "birth",
          ...placePartial,
          ...datePartial,
        }
      : undefined;

    return event;
  }

  return undefined;
}

function buildDeath(person, indi) {
  const [death] = indi.sub.get("https://gedcom.io/terms/v7/DEAT") ?? [];

  if (death) {
    const [place] = death.sub.get("https://gedcom.io/terms/v7/PLAC") ?? [];

    const placePartial = place ? { datum: place.payload.join(",") } : {};

    const [date] = death.sub.get("https://gedcom.io/terms/v7/DATE") ?? [];

    const datePartial =
      date && date.payload.date
        ? { actdate: renderDate(date.payload.date) }
        : {};

    const uuid = crypto.randomUUID();

    const event = date
      ? {
          _: "event",
          event: uuid,
          actname: person,
          category: "death",
          ...placePartial,
          ...datePartial,
        }
      : undefined;

    return event;
  }

  return undefined;
}

function buildMarriage(family) {
  const [husband] = family.sub.get("https://gedcom.io/terms/v7/FAM-HUSB") ?? [];

  const husbandPartial = husband ? [namePerson(husband.payload)] : [];

  const [wife] = family.sub.get("https://gedcom.io/terms/v7/FAM-WIFE") ?? [];

  const wifePartial = wife ? [namePerson(wife.payload)] : [];

  const spouses = [...husbandPartial, ...wifePartial];

  const [marriage] = family.sub.get("https://gedcom.io/terms/v7/MARR") ?? [];

  if (marriage) {
    const [place] = marriage.sub.get("https://gedcom.io/terms/v7/PLAC") ?? [];

    const placePartial = place ? { datum: place.payload.join(",") } : {};

    const [date] = marriage.sub.get("https://gedcom.io/terms/v7/DATE") ?? [];

    const datePartial =
      date && date.payload.date
        ? { actdate: renderDate(date.payload.date) }
        : {};

    const uuid = crypto.randomUUID();

    const event =
      date && spouses
        ? {
            _: "event",
            event: uuid,
            actname: spouses,
            category: "marriage",
            ...placePartial,
            ...datePartial,
          }
        : undefined;

    return event;
  }

  return undefined;
}

function buildPerson(indi) {
  const person = namePerson(indi);

  const parents = buildParents(indi);

  const personPartial = parents.length
    ? [{ _: "person", person, parent: parents }]
    : [];

  const birth = buildBirth(person, indi);

  const birthPartial = birth ? [birth] : [];

  const death = buildDeath(person, indi);

  const deathPartial = death ? [death] : [];

  return [...personPartial, ...birthPartial, ...deathPartial];
}

export default async function parseGEDCOM(sourcePath) {
  const data = await fs.promises.readFile(sourcePath, "utf8");

  const g7v = new G7Lookups(g7validation);

  const gedc = GEDCStruct.fromString(data, g7ConfGEDC, g7v.err);

  const ged7 = G7Dataset.fromGEDC(gedc, g7v);

  // expects this schema
  // should not write to avoid destructive actions
  // const schemaRecord = {
  //   _: "_",
  //   branch: ["cognate", "description_en", "description_ru", "task", "trunk"],
  //   event: ["actdate", "actname", "category", "datum", "saydate", "sayname"],
  //   person: "parent",
  // };

  // const cognates = [
  //   {
  //     _: "branch",
  //     branch: "actname",
  //     cognate: "person",
  //   },
  //   {
  //     _: "branch",
  //     branch: "sayname",
  //     cognate: "person",
  //   },
  //   {
  //     _: "branch",
  //     branch: "person",
  //     cognate: "parent",
  //   },
  // ];

  const individuals = ged7.records.get(
    "https://gedcom.io/terms/v7/record-INDI",
  );

  const persons = individuals.map(buildPerson).flat().filter(Boolean);

  const families = ged7.records.get("https://gedcom.io/terms/v7/record-FAM");

  const marriages = families.map(buildMarriage).filter(Boolean);

  const records = [...persons, ...marriages];

  const toStream = ReadableStream.from(records);

  return toStream;
}
