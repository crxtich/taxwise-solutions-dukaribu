export type ClientLogo = {
  name: string;
  image: string;
};

const clientAsset = (fileName: string) => `/clients/${encodeURIComponent(fileName)}`;

export const clientLogos: ClientLogo[] = [
  { name: "Bonvaley", image: clientAsset("Bonvaley Logo.jpg") },
  { name: "Diani Regata", image: clientAsset("Diani Regata Logo.jpg") },
  { name: "Happy Nest", image: clientAsset("Happy Nest Logo.jpeg") },
  { name: "Hope of an African Child CBO", image: clientAsset("Hope of an African Child CBO logo.jpg") },
  { name: "Hydrological Society of Kenya", image: clientAsset("Hydrological Society of Kenya Logo.png") },
  { name: "Kabene Trust", image: clientAsset("Kabene Trust Logo.jpg") },
  { name: "Mekaela Foundation", image: clientAsset("Mekaela Foundation Logo.jpeg") },
  { name: "Musren", image: clientAsset("Musren Logo.jpeg") },
  { name: "Pinnovate", image: clientAsset("Pinnovate Logo.png") },
  { name: "SambaSports Youth Agenda", image: clientAsset("SambaSports Youth Agenda Logo.jpg") },
];
