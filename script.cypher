// Creation des suspects
CREATE (Moutarde:Person {name:'Colonel Moutarde', color:'yellow'})
CREATE (Olive:Person {name:'Docteur Olive', color:'green'})
CREATE (Violet:Person {name:'Professeur Violet', color:'purple'})
CREATE (Pervenche:Person {name:'Madame Pervenche', color:'green'})
CREATE (Rose:Person {name:'Mademoiselle Rose', color:'red'})
CREATE (LeBlanc:Person {name:'Madame Leblanc', color:'white'})

// Creation des armes
CREATE (Poignard:Weapon {name:'Poignard'})
CREATE (Chandelier:Weapon {name:'Chandelier'})
CREATE (Revolver:Weapon {name:'Revolver'})
CREATE (Corde:Weapon {name:'Corde'})
CREATE (Matraque:Weapon {name:'Matraque'})
CREATE (ClefAnglaise:Weapon {name:'Clef Anglaise'})

// Creation des lieux
CREATE (Cuisine:Room {name:'Cuisine'})
CREATE (GrandSalon:Room {name:'Grand Salon'})
CREATE (PetitSalon:Room {name:'Petit Salon'})
CREATE (SalleAManger:Room {name:'Salle a manger'})
CREATE (Bureau:Room {name:'Bureau'})
CREATE (Bibilotheque:Room {name:'Bibilotheque'})
CREATE (Veranda:Room {name:'Veranda'})
CREATE (Hall:Room {name:'Hall'})
CREATE (Studio:Room {name:'Studio'})