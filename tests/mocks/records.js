const record2001 = {
  _: "event",
  event: "event1",
  datum: "value1",
  file: {
    _: "file",
    file: "file1",
    filename: "path/to/1",
    fileext: "jpg",
    moddate: "2001-01-01",
  },
  saydate: "2001-01-01",
  sayname: "name1",
  actdate: "2001-01-01",
  actname: "name1",
};

const record2002 = {
  _: "event",
  event: "event2",
  datum: "value2",
  file: {
    _: "file",
    file: "file2",
    filename: "path/to/2",
    moddate: "2002-01-01",
  },
  saydate: "2002-01-01",
  sayname: "name2",
  actdate: "2002-01-01",
  actname: "name2",
};

const record2003 = {
  _: "event",
  event: "event3",
  datum: "",
  saydate: "2003-01-01",
  sayname: "name3",
  actdate: "2003-01-01",
  actname: "name3",
};

const recordFile = {
  _: "filepath",
  filepath: "index.txt",
  moddate: "2024-09-09T00:56:34",
  sourcepath: "/Volumes/mm/codes/csvs-nodejs/tests/mocks/fs/default",
};

const recordFileListing = {
  _: "filepath",
  filepath: "index.txt",
  filehash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  filesize: "0",
  moddate: "2024-09-09T00:56:34",
};

const recordsPedigree = [
  {
    _: "_",
    branch: ["cognate", "description_en", "description_ru", "task", "trunk"],
    event: ["actdate", "actname", "category", "datum", "saydate", "sayname"],
    person: "parent",
  },
  { _: "branch", branch: "actname", cognate: "person" },
  { _: "branch", branch: "sayname", cognate: "person" },
  { _: "branch", branch: "person", cognate: "parent" },
  {
    _: "event",
    actname: "Victoria_Hanover_57192892",
    actdate: "1819-05-24",
    category: "birth",
    datum: "Kensington,Palace,London,England",
  },
  {
    _: "event",
    actname: "Victoria_Hanover_57192892",
    actdate: "1901-01-22",
    category: "death",
    datum: "Osborne House,Isle of Wight,England",
  },
  {
    _: "event",
    actname: "Albert_Augustus_Charles_58195837",
    actdate: "1819-08-26",
    category: "birth",
    datum: "Schloss Rosenau,Near Coburg,Germany",
  },
  {
    _: "event",
    actname: "Albert_Augustus_Charles_58195837",
    actdate: "1861-12-14",
    category: "death",
    datum: "Windsor Castle,Berkshire,England",
  },
  {
    _: "event",
    actname: "Victoria_Adelaide_Mary_91581920",
    actdate: "1840-11-21",
    category: "birth",
    datum: "Buckingham,Palace,London,England",
  },
  {
    _: "event",
    actname: "Victoria_Adelaide_Mary_91581920",
    actdate: "1901-08-05",
    category: "death",
    datum: "Friedrichshof,Near,Kronberg,Taunus",
  },
  {
    _: "event",
    actname: "Edward_VII_Wettin_85157273",
    actdate: "1841-11-09",
    category: "birth",
    datum: "Buckingham,Palace,London,England",
  },
  {
    _: "event",
    actname: "Edward_VII_Wettin_85157273",
    actdate: "1910-05-06",
    category: "death",
    datum: "Buckingham,Palace,London,England",
  },
  {
    _: "event",
    actname: ["Albert_Augustus_Charles_58195837", "Victoria_Hanover_57192892"],
    actdate: "1840-02-10",
    category: "marriage",
    datum: "Chapel Royal,St. James Palace,England",
  },
  {
    _: "person",
    person: "Edward_VII_Wettin_85157273",
    parent: ["Albert_Augustus_Charles_58195837", "Victoria_Hanover_57192892"],
  },
  {
    _: "person",
    person: "Victoria_Adelaide_Mary_91581920",
    parent: ["Albert_Augustus_Charles_58195837", "Victoria_Hanover_57192892"],
  },
];

const recordsVK = [
  {
    _: "datum",
    actdate: "2001-11-17T20:29:58",
    actname: "you",
    category: "vk",
    datum: `
                  Hello
                  `,
    sayname: "Private community",
  },
  {
    _: "datum",
    actdate: "2001-11-17T20:29:19",
    actname: "you",
    category: "vk",
    datum:
      `
                  Message with attachments
                  ` +
      `
                        3 attached messages
                      ` +
      `

`,
    sayname: "Private community",
  },
  {
    _: "datum",
    actdate: "2001-11-17T20:28:38",
    actname: "Private community",
    category: "vk",
    datum: `
                  Hello world
                  `,
    sayname: "you",
  },
];

const recordsTG = [
  {
    _: "datum",
    actdate: "2018-11-01T00:13:47",
    actname: "Bob",
    category: "tg",
    datum: "Hello world",
    sayname: "you",
  },
  {
    _: "datum",
    actdate: "2018-12-06T18:11:15",
    actname: "Bob",
    category: "tg",
    datum: "Reply http://example.com ",
    sayname: "you",
  },
  {
    _: "datum",
    actdate: "2018-12-06T18:11:15",
    actname: "Bob",
    category: "tg",
    datum: "",
    sayname: "you",
  },
];

export default {
  record2001,
  record2002,
  record2003,
  recordFile,
  recordFileListing,
  recordsPedigree,
  recordsVK,
  recordsTG,
};
