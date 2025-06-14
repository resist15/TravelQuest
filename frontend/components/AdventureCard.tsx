import Image from "next/image";

type Adventure = {
  name: string;
  image?: string | null; // ← allow null as well
  tags: string[];
  location: string;
};

type AdventureCardProps = {
  adventure: Adventure;
};

export default function AdventureCard({ adventure }: AdventureCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      {adventure.image ? (
        <Image
          src={adventure.image}
          alt={adventure.name}
          width={600}
          height={200}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="h-40 bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-sm text-white">
          No image found
        </div>
      )}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{adventure.name}</h3>
        <div className="flex flex-wrap gap-1 text-xs">
          {adventure.tags.map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded-full bg-secondary">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">📍 {adventure.location}</p>
      </div>
    </div>
  );
}
