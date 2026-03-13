import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../app.routes';
import { decompresssPgn } from '../chessboard/chessboard/pgn-misc';

@Component({
  selector: 'app-load-pgn',
  imports: [],
  templateUrl: './load-pgn.html',
  styleUrl: './load-pgn.css',
})
export class LoadPgn {

  compressedPgn: WritableSignal<string> = signal("");
  decompressedPgn: WritableSignal<string> = signal("");

  constructor(private route: ActivatedRoute, private router: Router)
  {
    this.route.paramMap.subscribe(params => 
    {
      this.compressedPgn.set(params.get(RouteConstants.ROUTE_PGN)!);
      this.decompressedPgn.set(decompresssPgn(this.compressedPgn()));
    });
  }

  ngOnInit(): void 
  {
    this.router.navigate(['/'], {state: {"pgn" : this.decompressedPgn()}})
  }

  isError()
  {
    return !this.compressedPgn();
  }
}
