import { Router } from "express";
import { GetGamificationRankingQueryParams } from "@workspace/api-zod";

const router = Router();

const RANKINGS: Record<string, unknown[]> = {
  technicians: [
    { position: 1, name: "Carlos Santos", avatarUrl: null, points: 4850, category: "technicians", badge: "Ouro", change: 0 },
    { position: 2, name: "Ana Lima", avatarUrl: null, points: 4210, category: "technicians", badge: "Ouro", change: 1 },
    { position: 3, name: "Roberto Gomes", avatarUrl: null, points: 3980, category: "technicians", badge: "Prata", change: -1 },
    { position: 4, name: "Juliana Faria", avatarUrl: null, points: 3450, category: "technicians", badge: "Prata", change: 2 },
    { position: 5, name: "Marcos Souza", avatarUrl: null, points: 2980, category: "technicians", badge: "Bronze", change: 0 },
    { position: 6, name: "Patricia Costa", avatarUrl: null, points: 2750, category: "technicians", badge: "Bronze", change: -2 },
    { position: 7, name: "Diego Ramos", avatarUrl: null, points: 2340, category: "technicians", badge: "Bronze", change: 1 },
  ],
  attendants: [
    { position: 1, name: "Fernanda Oliveira", avatarUrl: null, points: 5120, category: "attendants", badge: "Ouro", change: 0 },
    { position: 2, name: "Lucas Martins", avatarUrl: null, points: 4680, category: "attendants", badge: "Ouro", change: 0 },
    { position: 3, name: "Camila Ferreira", avatarUrl: null, points: 4200, category: "attendants", badge: "Prata", change: 1 },
    { position: 4, name: "Bruno Alves", avatarUrl: null, points: 3810, category: "attendants", badge: "Prata", change: -1 },
    { position: 5, name: "Larissa Torres", avatarUrl: null, points: 3200, category: "attendants", badge: "Bronze", change: 0 },
  ],
  suppliers: [
    { position: 1, name: "TechDistrib Nordeste", avatarUrl: null, points: 3800, category: "suppliers", badge: "Ouro", change: 0 },
    { position: 2, name: "NetSol Equipamentos", avatarUrl: null, points: 3200, category: "suppliers", badge: "Prata", change: 1 },
    { position: 3, name: "FibrasNordeste", avatarUrl: null, points: 2900, category: "suppliers", badge: "Bronze", change: -1 },
  ],
};

router.get("/gamification/ranking", (req, res) => {
  try {
    const { category } = GetGamificationRankingQueryParams.parse(req.query);
    if (category && RANKINGS[category]) {
      return res.json(RANKINGS[category]);
    }
    const all = [...RANKINGS.technicians, ...RANKINGS.attendants, ...RANKINGS.suppliers];
    res.json(all);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
