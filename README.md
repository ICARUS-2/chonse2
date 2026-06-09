<div align="center">
  <img src="https://github.com/ICARUS-2/ICARUS-2.github.io/blob/master/docs/assets/img/icon/android-chrome-192x192.png">
  <h1 align="center"><a href="https://icarus-2.github.io/chonse2" target="blank">CHONSE2</a></h1>  
  <p>The Most Luminous Chess App</p>
  <hr>
  <img src="https://raw.githubusercontent.com/ICARUS-2/chonse2/refs/heads/main/screenshot.png">
</div>

<p align="center">CHONSE2 is an open-source chess web app to play, edit boards, and analyze/share games on any device.</p>

# Features
## Analysis
- Load and analyze games from Chess.com, Lichess, or manually from an inputted PGN via the Stockfish version of your choice.
- Easily link to and share games/analyses with friends.
- Display move classifications (Luminous, perfect, blunder, etc), engine hierarchy, accuracies, elo estimations, graphs and evaluation bar.
- Perform moves with real-time analysis.
- Cloud Hybrid analysis mode, allowing for deeper, faster evaluations using a fraction of the CPU power.
- Multithreading analysis support, allowing for analysis up to 12x faster on capable devices.

## Editor
- Input any position onto a board via dragging and dropping.
- Set castling and en passant rights.
- Analyze inputted position or play vs AI from there.

## Play vs AI
- Set player color and elo limitations for Stockfish.
- Analyze games played against AI.

# Tech Stack
- Built with [Angular](https://angular.dev/) Zoneless, [NMRugg Stockfish JS](https://github.com/nmrugg/stockfish.js/) and engine code adapted from [Chesskit](https://github.com/GuillaumeSD/Chesskit).
- Deployed using GitHub Pages.

# Running Locally
Ensure [Node+NPM](https://nodejs.org/en) are installed.

Install dependencies
```bash
npm install
```

Run dev server
```bash
ng serve --host=0.0.0.0
```

Open [http://localhost:4200/chonse2/](http://localhost:4200/chonse2/) in the browser.
