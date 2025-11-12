import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Product} from "../../api-services/models/product";
import {ProductService} from "../../api-services/services/product.service";
import {Specification} from "../../api-services/models/specification";
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {ObserverService} from "../../services/observer-service/observer.service";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgbTooltipModule,
    MatFormField,
    MatInput,
    MatIconModule,
    MatLabel,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss'
})
export class CreateProductComponent implements OnInit{

  protected readonly Array = Array;
  error: string = ''
  msg: string = ''
  product: Product = {productId: '', name: '', specifications: []}
  specifications: Specification[] = [
    {
      unit: '', price: 0, amountPerBox: 0
    }
  ]
  id: string = ''
  title: string = 'Thêm sản phẩm'
  editMode: boolean = false

  constructor(
    private service: ProductService,
    private observer: ObserverService
  ) {
  }

  ngOnInit(): void {
    this.observer.object$.subscribe(object => {
      if (object) {
        this.product = object.object
        this.id = this.product.productId || ''
        this.title = object.title
        this.editMode = object.editMode
        if (this.product.specifications) {
          this.specifications = this.product.specifications
        }
      }
    })

    this.observer.reset$.subscribe(object => {
      if(object && object.mode == 'product') {
        this.reset()
      }
    })
    }

  createProduct() {
    this.error = ''
    if (!this.product.productId || !this.product.name ) {
      this.error = 'Vui lòng điền đầy đủ thông tin'
      return
    }

    for (let i = 0 ; i < this.specifications.length ; i++) {
      if (this.specifications.length > 1 && (
        !this.specifications[i].unit || !this.specifications[i].price || !this.specifications[i].amountPerBox
      )) {
        this.error = `Quy cách ${i + 1} thiếu thông tin`
        return
      }
    }

    if (this.specifications.length > 1 ||
      (this.specifications.length == 1 && this.specifications[0].unit && this.specifications[0].price && this.specifications[0].amountPerBox)
    ) {
      this.product.specifications = this.specifications
    } else {
      this.product.specifications = []
    }
    this.service.createProduct({
      body: this.product
    }).subscribe({
      next: val => {
        this.msg = 'Thêm thành công'
        this.error = ''
        this.reset()
        setTimeout(() => {
          this.msg = ''
        }, 1000)
        this.observer.creationNotify(val)
      },
      error: err => {
        this.error = err.error
      }
    })
  }

  reset() {
    this.title = 'Thêm sản phẩm'
    this.editMode = false
    this.product.productId = ''
    this.product.name = ''
    this.product.specifications = []
    this.specifications = [{
      unit: '', price: 0, amountPerBox: 0
    }]
  }

  addSpecification() {
    this.specifications.push({
      unit: '', price: 0, amountPerBox: 0
    })
  }

  removeSpecification(i: number) {
    if (this.editMode) {
      this.service.deleteSpecification({
        id: this.id,
        "specification-id": this.specifications[i].id || 0
      }).subscribe({
        next: value => {
          console.log(value)
        },
        error: err => {
          console.log(err)
        }
      })
    }
    this.specifications =
      this.specifications.slice(0, i).concat(this.specifications.slice(i + 1))
  }

  updateProduct() {
    this.error = ''
    if (!this.product.id || !this.product.name ) {
      this.error = 'Vui lòng điền đầy đủ thông tin'
      return
    }

    for (let i = 0 ; i < this.specifications.length ; i++) {
      if (this.specifications.length > 1 && (
        !this.specifications[i].unit || !this.specifications[i].price || !this.specifications[i].amountPerBox
      )) {
        this.error = `Quy cách ${i + 1} thiếu thông tin`
        return
      }
    }

    if (this.specifications.length > 1 ||
      (this.specifications.length == 1 && this.specifications[0].unit && this.specifications[0].price && this.specifications[0].amountPerBox)
    ) {
      this.product.specifications = this.specifications
    } else {
      this.product.specifications = []
    }

    this.service.updateProduct({
      id: this.id,
      body: this.product
    }).subscribe({
      next: value => {
        console.log(value)
        this.msg = 'Chỉnh sửa thành công'
        this.error = ''
        setTimeout(() => {
          this.msg = ''
        }, 1000)
        this.observer.creationNotify(value)
      },
      error: err => {
        this.error = err.error
      }
    })
  }

  deleteProduct() {
    this.observer.deleteNotify({
      type: 'product',
      id: this.id
    })
  }

  onSubmit() {
    if (this.editMode) {
      this.updateProduct()
    } else {
      this.createProduct()
    }
  }
}
