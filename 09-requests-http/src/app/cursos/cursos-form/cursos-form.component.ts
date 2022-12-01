import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CursosService } from '../cursos-lista/cursos.service';
import { AlertModalService } from '../../shared/alert-modal.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ThisReceiver } from '@angular/compiler';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cursos-form',
  templateUrl: './cursos-form.component.html',
  styleUrls: ['./cursos-form.component.css']
})
export class CursosFormComponent implements OnInit {

  formulario!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: CursosService,
    private modal: AlertModalService,
    private location: Location,
    private route: ActivatedRoute) { }

  ngOnInit() {

     /*  this.route.params.subscribe(
      (params: any) => {
        const id = params['id'];
        console.log(id);
        const curso$ = this.service.loadById(id);
        curso$.subscribe( curso => {
          this.updateForm(curso);
        });
      }
    ); */

       this.route.params
     .pipe(
      map((params: any) => params['id']),
      switchMap(id => this.service.loadById(id))
     )
     .subscribe(curso =>  this.updateForm(curso));

     // para fazer um crud pode ser usado o ConcatMat -> a ordem da requisão importa
     // mergeMap -> ordem da requisao NÃO importa 
     // exhaustMap -> espera a resposta para ir para a proxima requisao

    this.formulario = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  updateForm(curso: any) {
    this.formulario.patchValue({
      id: curso.id,
        nome: curso.nome
    })
  }

  hasError(field: string) {
    return this.formulario.get(field)?.errors
  }

  onSubmit() {
    console.log(this.formulario.value);
    if (this.formulario.valid) {
      console.log('Submit');
      this.service.create(this.formulario.value)
        .subscribe(
          success => {
            this.modal.showAlertSuccess('Criado com sucesso.');
            this.location.back();
          },
          error => this.modal.showAlertDanger('Erro ao criar curso, tente novamente.'),
          () => console.log('Request completa')
        )
    }
  }

  onCancel() {
    this.submitted = false;
    this.formulario.reset()
    console.log('Cancel')
  }
}
