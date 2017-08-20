Reticuland* is a MLG and real-time strategy game where gameplay is primarily centered around the tuning of a neuroevolution trainer. Players begin with a population of neural network-backed one-cell creatures on a "Game of Life"-like grid, seeded from their selected pretrained genome. New members are added to the population from their trainer in proportion to resources obtained, and removed based on individual energy consumption and age. Players guide evolution by tuning their trainer in real time. They can also interfer with the world and their population members in a limited capacity, such as controlling some inputs by placing beacons, or interactively editing networks. Many players control populations on the same grid, competing for resources. 

The initial trainer implemented will be a varient rtNEAT. An interface for implementing custom trainers is planned, allowing for competition between different training approaches. Trainers will only be constrained by the nature of the game mechanics, which will impose complexity costs. While a more distant goal, game mode and NN component interfaces are also planned. Between human involvment, game context, and ML techniques, these interfaces would enable an ever increasing surface area for expirementation.

More game details:
* The game world consists of a turn based grid of creatures, food, and rocks
* Creatures see 3 cells in front, know if something is behind or to the side, and know their internal state
* Creatures have a minimal set of actions: turn, move, push, pull, and bite
* Actions, neurons, connections, and age cost energy
* The game is currently being implemented in typescript using deeplearnjs
* The primary target is in-browser
* Offline training might be made somehow available to users as a mechanic

Reticuland is in the sparse genre of MLG pioneered NERO [1], in which "the player takes the role of a trainer, teaching skills to a set of intelligent agents controlled by rtNEAT". While they share education and engagement as aims, Reticuland has an emphasis on accessibility and extensibility. Other prominent design elements are inspired by zero-player games, such as Game of Life, gridworld [2] and evolv.io [3], as well as a number of popular real-time games, notably generals.io and slither.io.

Minecraft players played the game for more than 1 billion hours for the first two months of it's release on the Xbox 360 [4], and League of Legends players log more than that every month [5]. Successfully engaging games even garner research in their own right, such as Magic the Gathering turing completeness [6], or World of Warcraft epidemic research [7]. Harnessing a fraction of this engagement level for any kind of educational or research purposes would be a major boon.


*Reticuland = a portmanteau of reticulation + land, just a working title
1. NERO paper: http://nn.cs.utexas.edu/downloads/papers/stanley.cig05.pdf
2. Gridworld Demo: https://www.youtube.com/watch?v=Ksf6nFsr29Q 
3. Evolv.io: https://github.com/evolvio/evolv.io
4. Minecraft gameplay: https://www.gamespot.com/articles/gamers-have-spent-1-billion-hours-playing-minecraft-xbox-360 
5. League of Legends gameplay: http://www.nbcnews.com/tech/video-games/league-legends-players-log-1-billion-hours-month-f1C6423906
6. Magic the Gathering Turing completeness: http://www.toothycat.net/~hologram/Turing/index.html
7. World of Warcraft epidemic research: https://en.wikipedia.org/wiki/Corrupted_Blood_incident#Models_for_real-world_research

