import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../../app.routes';
import GameLinkHelper from '../../chessboard/chessboard/game-link-helper';

@Component({
  selector: 'app-load-fen',
  imports: [],
  templateUrl: './load-fen.html',
  styleUrl: './load-fen.css',
})
export class LoadFen {

  compressedFen: WritableSignal<string> = signal("");
  decompressedFen: WritableSignal<string> = signal("");


  constructor(private route: ActivatedRoute, private router: Router)
  {
    this.route.paramMap.subscribe(params => 
    {
      this.compressedFen.set(params.get(RouteConstants.ROUTE_FEN)!);
      this.decompressedFen.set(GameLinkHelper.decompressStringForUrl(this.compressedFen()));


    });
  }

  ngOnInit(): void 
  {
    this.router.navigate(['/editor'], {state: {"fen" : this.decompressedFen()}});
  }

  isError()
  {
    return !this.compressedFen();
  }
}
