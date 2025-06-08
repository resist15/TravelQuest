import SidebarFilter from "@/components/SidebarFilter";
import AdventureCard from "@/components/AdventureCard";

const adventures = [
  {
    id: 1,
    name: "Mar del Plata",
    location: "Mar del Plata, Buenos Aires, AR",
    tags: ["General 🌍", "Planned", "Private"],
    image: null,
  },
  {
    id: 2,
    name: "Hawai‘i County",
    location: "Hawai‘i County, Hawaii, US",
    tags: ["General 🌍", "Planned", "Private"],
    image: null,
  },
  {
    id: 3,
    name: "Sequoia National Park",
    location: "Tulare County, California, US",
    tags: ["National Park 🌍", "Visited", "Private"],
    image: null,
  },
];

export default function AdventuresPage() {
  return (
    <div className="flex bg-black min-h-screen text-foreground">
      <SidebarFilter />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-1">My Adventures</h1>
        <p className="text-muted-foreground mb-6">8 results matching your search</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adventures.map((adv) => (
            <AdventureCard key={adv.id} adventure={adv} />
          ))}
        </div>
      </main>
    </div>
  );
}
