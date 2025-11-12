import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit, QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {InvoiceRequest} from "../../api-services/models/invoice-request";
import {InvoiceService} from "../../api-services/services/invoice.service";
import {NgForOf, NgIf} from "@angular/common";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {ProductService} from "../../api-services/services/product.service";
import {CustomerService} from "../../api-services/services/customer.service";
import {MatSelectModule} from "@angular/material/select";
import {Product} from "../../api-services/models/product";
import {ObserverService} from "../../services/observer-service/observer.service";
import { MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {InvoiceLineRequest} from "../../api-services/models/invoice-line-request";
import {MatTooltipModule} from "@angular/material/tooltip";
import { MAT_DATE_FORMATS} from "@angular/material/core";


import {MatAutocompleteModule} from "@angular/material/autocomplete";
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgbTooltip,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateInvoiceComponent implements OnInit {
  protected readonly Array = Array;
  invoice: InvoiceRequest = {id: '', date: '', customerId: '', invoiceLines: []}
  invoiceLines: InvoiceLineRequest[] = [{
    note: '', numberOfBoxes: 0, productId: '', specificationId: 0
  }]
  readonly date = new FormControl(moment());
  error: string = ''
  msg: string = ''
  customerIds: string[] = []
  productIds: string[] = []
  customerIdControl = new FormControl<string | null>(null, Validators.required);
  productIdControl = [new FormControl<string | null>(null, Validators.required)];
  specificationControl = [new FormControl<string | null>(null, Validators.required)];
  products: Product[] = []
  id: string = ''
  title: string = 'Thêm hóa đơn'
  removingLines: number[] = []
  filteredCustomers: string[] = [];
  filteredProducts: string[] = []

  @ViewChild('customerIdInput') customerIdInput?: ElementRef<HTMLInputElement>
  @ViewChildren('productIdInputs') productIdInputs ?: QueryList<ElementRef>;

  constructor(
    private service: InvoiceService,
    private productService: ProductService,
    private customerService: CustomerService,
    private observer: ObserverService
  ) {


    this.filteredCustomers = this.customerIds.slice()
    this.filteredProducts = this.productIds.slice()
  }

  ngOnInit(): void {
    this.initialize()

    this.observer.objectCreated$.subscribe(newObject => {
      if (newObject) {
        this.initialize()
      }
    })

    this.observer.reset$.subscribe(object => {
      if(object && object.mode == 'invoice') {
        this.reset()
      }
    })
  }

  initialize() {
    this.productService.getAllProductIds()
      .subscribe({
        next: value => {
          this.productIds = value
          this.filteredProducts = this.productIds.slice()
        }
      })
    this.customerService.getAllCustomerIds()
      .subscribe({
        next: val => {
          this.customerIds = val
          this.filteredCustomers = val
        }
      })
    this.productService.getAllProducts()
      .subscribe({
        next: val => this.products = val
      })
  }

  addLine() {
    this.invoiceLines.push({
      note: '', numberOfBoxes: 0, productId: '', specificationId: 0
    })
    this.productIdControl.push(new FormControl<string | null>(null, Validators.required))
    this.specificationControl.push(new FormControl<string | null>(null, Validators.required))
    this.filteredProducts = this.productIds.slice()
  }

  removeLine(i: number) {
    this.removingLines.push(i)
    this.invoiceLines = this.invoiceLines.slice(0, i).concat(this.invoiceLines.slice(i+1))
    this.productIdControl = this.productIdControl.slice(0, i).concat(this.productIdControl.slice(i+1))
    this.specificationControl = this.specificationControl.slice(0, i).concat(this.specificationControl.slice(i+1))
  }

  reset() {
    this.title = 'Thêm hóa đơn'
    this.error = ''
    this.msg = ''
    this.invoice = {id: '', date: '', customerId: '', invoiceLines: []}
    this.invoiceLines = [{
      note: '', numberOfBoxes: 0, productId: '', specificationId: 0
    }]
    this.customerIdControl = new FormControl<string | null>(null, Validators.required);
    this.productIdControl = [new FormControl<string | null>(null, Validators.required)];
    this.specificationControl = [new FormControl<string | null>(null, Validators.required)];
  }

  createInvoice() {
    console.log(this.invoice)
    this.error = ''
    if (!this.invoice.date) {
      this.invoice.date = new Date().toISOString().slice(0, 10)
    }

    if (!this.invoice.id || !this.invoice.customerId) {
      this.error = `Vui lòng điền đầy đủ thông tin đơn hàng`
      return
    }

    if (this.invoiceLines.length > 0) {
      for (let i = 0 ; i < this.invoiceLines.length ; i++) {
        if (this.isNotFilled(i)) {
          this.error = `Vui lòng điền đầy đủ thông tin dòng ${i + 1}`
          return
        }
      }
      this.invoice.invoiceLines = this.invoiceLines
    } else {
      this.error = 'Hóa đơn không được trống'
      return
    }

    this.service.createInvoice({
      body: this.invoice
    }).subscribe({
      next: value => {
        this.error = ''
        this.msg = 'Thêm thành công'
        setTimeout(() => this.reset(), 1000)
        this.observer.creationNotify(value)
      },
      error: err => this.error = err.error
    })
  }

  updateDate(dateObject: any) {
    const ctrValue = this.date.value ?? moment()
    this.invoice.date = `${ctrValue.year()}-${String(ctrValue.month() + 1).padStart(2, '0')}-${String(ctrValue.date()).padStart(2, '0')}`;
  }

  filterSpecifications(productId: string): undefined | any[] {
    let temp = this.products.filter(p => p.productId == productId)
    return temp.length > 0 ? temp[0]?.specifications : []
  }

  isNotFilled(i: number): boolean {
    return !(this.invoiceLines[i].numberOfBoxes && this.invoiceLines[i].specificationId && this.invoiceLines[i].productId)
  }

  getProductName(id: string): string {
    const temp = this.products.filter(p => p.productId == id)
    if (temp.length && temp[0].name) {
      return temp[0].name
    }
    return 'Chọn mã sản phẩm'
  }

  filter(type: string, index: number): void {
    if (type == 'customer') {
      const filterValue = this.customerIdInput?.nativeElement.value.toLowerCase();
      this.filteredCustomers = this.customerIds.filter(o => o.toLowerCase().includes(filterValue || ''));
      if (this.customerIdControl.value) {
        this.invoice.customerId = this.customerIdControl.value
      }
    } else if (type == 'product' && this.productIdInputs) {
      for (let input of this.productIdInputs) {
        if (input.nativeElement.id == `product${index}`) {
          const filterValue = input.nativeElement.value.toLowerCase()
          this.filteredProducts = this.productIds.filter(id => id.toLowerCase().includes(filterValue || ''))
        }
      }
      if (this.productIdControl[index].value) {
        this.invoiceLines[index].productId = this.productIdControl[index].value || undefined
      }
    }

  }
}
