Reticuland* is a life simulation and real-time strategy game where gameplay is primarily centered around the tuning of a neuroevolution algorithm. Players begin with a population of neural network-backed creatures on a grid, seeded from their selected pretrained genome. New members are added to the population from their NEAT trainer in proportion to resources obtained. Players guide evolution by tuning their trainer in real time. They can also  interfer with the world and their population members in a limited capacity, such as interactively editing networks, and controling some inputs. This design aims to cultivate the study of, and intuition for, the ML algorithms and techniques involved.

The main sources of inspiration for these design elements are simulation projects like gridworld [1], as well as a recently-popularized genre of real-time games known as "io games", notably generals.io and slither.io. Reticuland is novel in that it aims combine the educational capacity of the former with the engagement level of the latter in a way that compounds both. 

While the intial implementaion aims to maintain a tight scope, it's premise can be expanded upon boundlessly. A primary goal would be the addition of interfaces for players and researchers to add custom trainers, models, or even game modes. Between human involvment, game context, and ML techniques, these interfaces would enable an ever increasing surface area for expirementation.
Some possibilities include:
* multicellular organisms
* adaptive inputs (changing shape, growing eyes)
* in-game training interfaces for methods like Q-learning
  * experience replay sharing via action
  * a "playable" training ring, so players could teach their creatures

Minecraft players played the game for more than 1 billion hours for the first two months of it's release on the Xbox 360 [2], and League of Legends players log more than that every month [3]. Successfully engaging games even garner research in their own right, such as Magic the Gathering turing completeness [4], or World of Warcraft epidemic research [5]. Harnessing a fraction of this engagement level for any kind of educational or research purposes would be a major boon.


*reticuland = a portmanteau of reticulation + land, just a working title

1. Gridworld Demo: https://www.youtube.com/watch?v=Ksf6nFsr29Q 
2. Minecraft gameplay: https://www.gamespot.com/articles/gamers-have-spent-1-billion-hours-playing-minecraft-xbox-360 
3. League of Legends gameplay: http://www.nbcnews.com/tech/video-games/league-legends-players-log-1-billion-hours-month-f1C6423906
4. Magic the Gathering Turing completeness: http://www.toothycat.net/~hologram/Turing/index.html
5. World of Warcraft epidemic research: https://en.wikipedia.org/wiki/Corrupted_Blood_incident#Models_for_real-world_research

