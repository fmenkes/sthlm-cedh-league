interface ScryfallCard {
  id: string;
  name: string;
  scryfall_uri: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: {
    name: string;
    image_uris: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }[];
  keywords: string[];
}