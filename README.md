# 5G en France

LIFPROJET Automne 2021



### Qu'est-ce que c'est ?

Il s'agit d'un site gratuit qui contient des informations sur les opérateurs 5G en France et permet notamment d'effectuer une recherche par département et arrondissement.



### La collecte de données 

Plusieurs sources de données ont été explorées et exploitées:

Dans un premier temps, nous avons trouvé <u>France Geojson</u> pour collecter des données sur les départements et arrondissements français.

Ensuite, nous avons trouvé <u>data.gouv.fr</u>, à partir duquel nous avons obtenu un fichier csv, qui contenait les informations sur les données des quatre principaux opérateurs dont nous avions besoin.

Enfin, nous utilisons python pour analyser les données.



### Le site

Le site Internet est principalement composé de trois parties :

Le centre de la page Web affiche une carte de France, qui contient des données sur les opérateurs 5G détenus à différents endroits.

Sur le côté gauche de la page se trouve une barre de recherche, nous pouvons rechercher différents départements ou arrondissements, ou cliquer sur les quatre boutons opérateurs.

Dans le coin inférieur gauche de la page se trouve une molette de défilement de la carte thermique, qui change en fonction du nombre d'opérateurs 5G sur place.



### Environnement de développement

Il faut configurer votre environnement de développement sur Windows.

Installez Vscode, installez le plugin *code runner* dans le magasin d'extensions vscode.

Téléchargez et installez node.js sur le site officiel, et ajoutez le chemin d'installation à la variable d'environnement.

Vérifiez si node.js est installé avec succès, win+R ouvre une fenêtre de commande, entrez node -v, si les informations de version sont sorties, l'installation est réussie.

Installation des plugins dans VsCode : Python 3.7.2 , Jupyter , Pandas



### Catalogue de développement

assets : placez des images, telles que des logos, etc.

components: Il y a un fichier de composant dans le répertoire composants, ce qui n'est pas nécessaire.

App.vue : fichier d'entrée de projet, on peut aussi écrire des composants directement ici au lieu d'utiliser le répertoire des composants.

main.js : le fichier principal du projet.

package.json : Fichier de configuration du projet



#### Développeurs :

Dan HOU: p2112915

Jingyi XIE: p2112917
