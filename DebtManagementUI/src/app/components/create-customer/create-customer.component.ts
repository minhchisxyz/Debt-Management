import {Component, OnInit} from '@angular/core';

import {CustomerService} from "../../api-services/services/customer.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {ObserverService} from "../../services/observer-service/observer.service";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Customer} from "../../api-services/models/customer";

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    MatFormField,
    MatInput,
    MatLabel,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.scss'
})
export class CreateCustomerComponent implements  OnInit {

  customer: Customer = {customerId: '', name: '', telephone: '', province: ''}
  id: string = ''
  error: string = ''
  msg: string = ''
  title: string = 'Thêm khách hàng'
  editMode: boolean = false

  constructor(
    private service: CustomerService,
    private observer: ObserverService
  ) {
  }

  ngOnInit(): void {
    this.observer.object$.subscribe(object => {
      if (object) {
        this.customer = object.object
        this.id = this.customer.customerId || ''
        this.title = object.title
        this.editMode = object.editMode
      }
    })

    this.observer.reset$.subscribe(object => {
      if(object && object.mode == 'customer') {
        this.reset()
      }
    })

  }

  createCustomer() {
    if (!this.customer.customerId || !this.customer.name || !this.customer.telephone || !this.customer.province) {
      this.error = 'Vui lòng điền đầy đủ thông tin'
      return
    }

    this.service.createCustomer({
      body: this.customer
    }).subscribe({
      next: res => {
        this.msg = 'Thêm thành công'
        this.error = ''
        this.reset()
        setTimeout(() => {
          this.error = ''
          this.msg = ''
        }, 1000)
        this.observer.updateNotify({
          type: 'customer'
        })
      },
      error: err => {
        this.error = err.error
      }
    })
  }

  reset(): void {
    this.customer.customerId = ''
    this.customer.name = ''
    this.customer.telephone = ''
    this.customer.province = ''
    this.title = 'Thêm khách hàng'
    this.editMode = false
  }

  updateCustomer() {
    if (!this.customer.customerId || !this.customer.name || !this.customer.telephone || !this.customer.province) {
      this.error = 'Vui lòng điền đầy đủ thông tin'
      return
    }

    this.service.updateCustomer({
      id: this.id,
      body: this.customer
    }).subscribe({
      next: value => {
        this.msg = 'Chỉnh sửa thành công'
        this.error = ''
        setTimeout(() => {
          this.error = ''
          this.msg = ''
        }, 1000)
        this.observer.creationNotify(value)
      },
      error: err => {
        console.log(err)
        this.error = err.error
      }
    })
  }

  deleteCustomer() {
    this.observer.deleteNotify({
      type: 'customer',
      id: this.id
    })
  }

  onSubmit() {
    if (this.editMode) {
      this.updateCustomer()
    } else {
      this.createCustomer()
    }
  }
}
