export type ClientLogo = {
  name: string;
  image: string;
};

const clientAsset = (fileName: string) => `/clients/${encodeURIComponent(fileName)}`;

export const clientLogos: ClientLogo[] = [
  { name: "Africa Child CBO", image: clientAsset("Africa Child CBO.jpg") },
  { name: "Bonvaley", image: clientAsset("Bonvaley Logo.jpg") },
  { name: "Diani Regata", image: clientAsset("Diani Regata Logo.jpg") },
  { name: "Happy Nest", image: clientAsset("Happy Nest Logo.jpeg") },
  { name: "Hydrological Society of Kenya", image: clientAsset("Hydrological Society of Kenya Logo.png") },
  { name: "Kabene Trust", image: clientAsset("Kabene Trust Logo.jpg") },
  { name: "Mekaela Foundation", image: clientAsset("Mekaela Foundation Logo.jpeg") },
  { name: "Musren", image: clientAsset("Musren Logo.jpeg") },
  { name: "Peace Hardware & Supplies Ltd", image: clientAsset("Peace hardware & Supplies ltd.jpeg") },
  { name: "Pinnovate", image: clientAsset("Pinnovate Logo.png") },
  { name: "SambaSports Youth Agenda", image: clientAsset("SambaSports Youth Agenda Logo.jpg") },
];
