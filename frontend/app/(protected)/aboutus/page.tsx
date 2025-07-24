"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const team = [
    {
        name: "Sourav Jagtap",
        role: "Core-Member",
        bio: "I don't know how it works but it just works.",
        image: "./avatars/sourav.webp",
    },
    {
        name: "Mitray Pandit",
        role: "Core-Member",
        bio: "Fall seven times, stand up eight.",
        image: "./avatars/mitray.jpeg",
    },
    {
        name: "Devika Dixit",
        role: "Core-Member",
        bio: "You gotta do what you gotta do 乁(ツ)ㄏ",
        image: "./avatars/devika.jpg",
    },
    {
        name: "Ketaki Pawar",
        role: "Core-Member",
        bio: "Be kind",
        image: "https://ui-avatars.com/api/?name=Ketaki+Pawar",
    },
    {
        name: "Geeta Pujari",
        role: "Core-Member",
        bio: "",
        image: "https://ui-avatars.com/api/?name=Geeta+Pujari",
    },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center"
            >
                <h1 className="text-4xl font-bold">👥 About Our Team</h1>
                <p className="text-muted-foreground mt-2">
                    Meet the passionate team behind TravelQuest — a collaborative journey to build a smarter way to track your adventures.
                </p>
                <Separator className="my-6" />
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {team.map((member, i) => (
                    <motion.div
                        key={member.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.4 }}
                    >
                        <Card className="hover:scale-[1.02] transition-transform h-full">
                            <CardHeader className="flex items-center space-x-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={member.image} alt={member.name} />
                                    <AvatarFallback>
                                        {member.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{member.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground">{member.bio}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
