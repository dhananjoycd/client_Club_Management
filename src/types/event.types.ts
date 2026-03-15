export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  capacity: number;
  _count?: {
    registrations: number;
  };
};
