
export interface Champion {
  id: string;
  name: string;
  title: string;
  image: string;
  roles: string[];
}

export const champions: Champion[] = [
  {
    id: "aatrox",
    name: "Aatrox",
    title: "the Darkin Blade",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Aatrox.png",
    roles: ["Fighter", "Tank"]
  },
  {
    id: "ahri",
    name: "Ahri",
    title: "the Nine-Tailed Fox",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Ahri.png",
    roles: ["Mage", "Assassin"]
  },
  {
    id: "akali",
    name: "Akali",
    title: "the Rogue Assassin",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Akali.png",
    roles: ["Assassin"]
  },
  {
    id: "akshan",
    name: "Akshan",
    title: "the Rogue Sentinel",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Akshan.png",
    roles: ["Marksman", "Assassin"]
  },
  {
    id: "alistar",
    name: "Alistar",
    title: "the Minotaur",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Alistar.png",
    roles: ["Tank", "Support"]
  },
  {
    id: "amumu",
    name: "Amumu",
    title: "the Sad Mummy",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Amumu.png",
    roles: ["Tank", "Fighter"]
  },
  {
    id: "anivia",
    name: "Anivia",
    title: "the Cryophoenix",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Anivia.png",
    roles: ["Mage", "Support"]
  },
  {
    id: "annie",
    name: "Annie",
    title: "the Dark Child",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Annie.png",
    roles: ["Mage"]
  },
  {
    id: "aphelios",
    name: "Aphelios",
    title: "the Weapon of the Faithful",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Aphelios.png",
    roles: ["Marksman"]
  },
  {
    id: "ashe",
    name: "Ashe",
    title: "the Frost Archer",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Ashe.png",
    roles: ["Marksman", "Support"]
  },
  {
    id: "aurelionsol",
    name: "Aurelion Sol",
    title: "The Star Forger",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/AurelionSol.png",
    roles: ["Mage"]
  },
  {
    id: "azir",
    name: "Azir",
    title: "the Emperor of the Sands",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Azir.png",
    roles: ["Mage", "Marksman"]
  },
  {
    id: "bard",
    name: "Bard",
    title: "the Wandering Caretaker",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Bard.png",
    roles: ["Support", "Mage"]
  },
  {
    id: "blitzcrank",
    name: "Blitzcrank",
    title: "the Great Steam Golem",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Blitzcrank.png",
    roles: ["Tank", "Support"]
  },
  {
    id: "brand",
    name: "Brand",
    title: "the Burning Vengeance",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Brand.png",
    roles: ["Mage", "Support"]
  },
  {
    id: "braum",
    name: "Braum",
    title: "the Heart of the Freljord",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Braum.png",
    roles: ["Support", "Tank"]
  },
  {
    id: "caitlyn",
    name: "Caitlyn",
    title: "the Sheriff of Piltover",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Caitlyn.png",
    roles: ["Marksman"]
  },
  {
    id: "camille",
    name: "Camille",
    title: "the Steel Shadow",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Camille.png",
    roles: ["Fighter", "Tank"]
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    title: "the Serpent's Embrace",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Cassiopeia.png",
    roles: ["Mage"]
  },
  {
    id: "chogath",
    name: "Cho'Gath",
    title: "the Terror of the Void",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Chogath.png",
    roles: ["Tank", "Mage"]
  },
  {
    id: "corki",
    name: "Corki",
    title: "the Daring Bombardier",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Corki.png",
    roles: ["Marksman"]
  },
  {
    id: "darius",
    name: "Darius",
    title: "the Hand of Noxus",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Darius.png",
    roles: ["Fighter", "Tank"]
  },
  {
    id: "diana",
    name: "Diana",
    title: "Scorn of the Moon",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Diana.png",
    roles: ["Fighter", "Mage"]
  },
  {
    id: "draven",
    name: "Draven",
    title: "the Glorious Executioner",
    image: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Draven.png",
    roles: ["Marksman"]
  }
];
