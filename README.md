# 🕵️ Cluedo - Jeu d'enquête interactif

Ce projet est une **version web simplifiée du Cluedo**, développée avec **ReactJS** côté frontend et **Neo4j** pour la base de données.  
Le joueur évolue dans les différentes pièces, interagit avec des cartes et peut formuler des hypothèses pour résoudre le crime.

🖼️ Des **captures d’écran explicatives** sont disponibles sur : [lgelgon.fr/PageCluedo](https://lgelgon.fr/PageCluedo)

---

## 🧩 Fonctionnalités principales

- Génération aléatoire d’un crime (suspect, arme, pièce)
- Attribution aléatoire des cartes aux joueurs
- Déplacements dans les pièces connectées via un graphe Neo4j
- Hypothèse possible à tout moment (suspect, arme, pièce)
- Réponse instantanée : victoire ou informations partielles
- IA qui se déplace à chaque tour
- Affichage des cartes du joueur

---

## ⚙️ Technologies utilisées

- **ReactJS** (Frontend)
- **Neo4j** (Base de données de graphes)
- **Cypher** (langage de requête Neo4j)
- **React-Bootstrap** (UI)

---

## 🗺️ Règles du jeu

1. Le joueur et trois IA sont placés dans des pièces aléatoires.
2. Le joueur peut se déplacer dans les pièces adjacentes.
3. À tout moment, il peut formuler une hypothèse :
   - Qui est le coupable ?
   - Quelle est l’arme ?
   - Où le crime a-t-il eu lieu ?
4. Le jeu indique quels éléments sont corrects.
5. Si l’hypothèse est entièrement correcte : **vous gagnez !**

---

## 📁 Structure 

```
📦 cluedo-game/
 ┣ components/
 ┃ ┗ Board.jsx
 ┣ App.jsx
 ┣ services/
 ┃ ┗ neo4j.js (requêtes Cypher)
 ┣ assets/
 ┃ ┗ images des pièces et cartes
 ┣ styles/
 ┃ ┗ Board.css
 ┗ ...
```

## 👨‍💻 Auteur

Lucas Gelgon  
