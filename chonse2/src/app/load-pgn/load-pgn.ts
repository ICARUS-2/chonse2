import { Component, signal, WritableSignal, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../app.routes';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';

@Component({
  selector: 'app-load-pgn',
  imports: [],
  templateUrl: './load-pgn.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './load-pgn.css',
})
export class LoadPgn {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  compressedPgn: WritableSignal<string> = signal("");
  decompressedPgn: WritableSignal<string> = signal("");

  constructor()
  {
    this.route.paramMap.subscribe(params => 
    {
      this.compressedPgn.set(params.get(RouteConstants.ROUTE_PGN)!);
      this.decompressedPgn.set(GameLinkHelper.decompressStringForUrl(this.compressedPgn()));
    });
  }

  ngOnInit(): void 
  {
    this.router.navigate(['/analysis'], {state: {"pgn" : this.decompressedPgn()}})
  }

  isError()
  {
    return !this.compressedPgn();
  }
}
