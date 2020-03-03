import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup,  FormBuilder,  Validators } from '@angular/forms';
import states from './states.json';
import { PlacesService } from 'src/app/services/places.service.js';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as CanvasJS from '../../../assets/canvasjs.min' ;
// import { DatePipe } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers:  [ PlacesService ],
})

export class HomeComponent implements OnInit {
    public stateList:{name:string, code:string}[] = states;
    angForm: FormGroup;
    

    @ViewChild('chartContainer', {static: false}) container;
    @ViewChild("modalContent", {static: false}) modalContent;

    //chart: anychart.core.cartesian.series.RangeBar = null;
    public chart:any;
    public cityList: any[];
    public city: string;
    public street: string;
    public state: string;
    public latitude: any;
    public longitude: any;

    public state_seal_URL: string;
    public weather_info:any = {};
    // public weather_type: any = '';
    public selectedDate_index = 0;
    public weatherIcon_URL = '';
    public selected_date:any;
    public progressValue = 0;
    public isProgressBar = false;
    public favoriteList = [];
    public isFavorite = false;
    public isInvalid = false;
    public isSearch = false;
    public resultBtn_flag = true;
    public card_favorite_flag = false;
    public favorite_count = 0;
    public select_favorite_index = 0;
    public select_favoriteData_index = 0;

    public chartOptions = { 
        responsive: true ,
        scales: {
            yAxes: [{ scaleLabel: { display: true, labelString: 'probability' }}], 
            xAxes: [{scaleLabel: { display: true, labelString: 'probability'} }]
        }
    };

    public chartData = [
        { 
            data: [0], 
            label: 'Temperature',
        },];

    public chartLabels = [''];
    public colors = [{ backgroundColor: 'rgba(112,164,196,0.9)'}];
   
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(private fb: FormBuilder, private placesService: PlacesService, private modalService: NgbModal) {
        this.createForm();
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    openDetailModal() {
        // const modalRef = this.modalService.open(NgbdModalContent);
        // modalRef.componentInstance.name = 'World';
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    searchCity(e) {
        let val = this.angForm.get('city').value;
        this.placesService.getPlaces(val).subscribe((response: any) => {
            this.cityList = response.data.predictions;
            // console.log(this.cityList);
        })
        // console.log(val);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    changeCurrentLocationStatus() {
    let checkValue = this.angForm.get('currentLocation').value;

        if (!checkValue) {
            this.angForm.controls['street'].disable();
            this.angForm.controls['city'].disable();
            this.angForm.controls['state'].disable();

            this.isInvalid = false;
            this.isSearch = false;
        }else
        {
            this.angForm.controls['street'].enable();
            this.angForm.controls['city'].enable();
            this.angForm.controls['state'].enable();
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    onClear(){
        this.angForm.controls['street'].enable();
        this.angForm.controls['city'].enable();
        this.angForm.controls['state'].enable();
        this.angForm.controls['currentLocation'].setValue(false);
        this.angForm.controls['street'].setValue("");
        this.angForm.controls['city'].setValue("");
        this.angForm.controls['state'].setValue("");
        this.isInvalid = false;
        this.isSearch = false;
        this.isFavorite = false;
        this.resultBtn_flag = true;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    searchWeather() {
        let checkValue = this.angForm.get('currentLocation').value;
        this.progressValue = 0;
        this.resultBtn_flag = true;
        this.isProgressBar = true;
        this.isFavorite = false;
        this.isSearch = false;        

        if (checkValue) {
            this.placesService.getCurrentLocation().subscribe((response: any) => {
                // console.log(response);
                this.latitude = response.lat;
                this.longitude = response.lon;
                this.city = response.city;
                // document.getElementById('current_title').innerHTML= response.city;
                this.state = response.regionName;

                if(response) this.progressValue = 50;
                else this.progressValue = 0;
                this.isInvalid = false;

                this.placesService.getCustomSearch(this.state).subscribe((response: any) => {
                    // console.log('Custom Search: ', response);                    
                    this.state_seal_URL = response.data.items[0].link ;
                    // document.getElementById('state_seal_img').setAttribute( 'src', response.data.items[0].link );
                });

                this.placesService.getWeatherData(this.latitude, this.longitude).subscribe((response: any) => {
                    // console.log(response); 
                    this.weather_info = response.data ;

                    if(response.data)  {
                        this.progressValue = 100;
                    }
                    else this.progressValue = 0;

                    if(this.progressValue == 0){
                        this.isInvalid = true;
                    }
                    else{
                        setTimeout(()=>{this.isProgressBar = false;}, 1000);
                        this.isSearch = true;
                        this.favorite_count = this.favorite_count + 1;
                    }


                 })
            })
        } else {            
            let street = this.angForm.get('street').value;
            this.city = this.angForm.get('city').value;
            this.state = this.angForm.get('state').value;
            
            this.placesService.getCustomSearch(this.state).subscribe((response: any) => {
                // console.log('Custom Search: ', response);
                this.state_seal_URL = response.data.items[0].link ;
            });

            this.placesService.getLocationByGeolocation(street, this.city , this.state).subscribe((response: any) => {
                console.log(response);
                if (response.data) {
                    this.latitude = response.data.results[0].geometry.location.lat;
                    this.longitude = response.data.results[0].geometry.location.lng;
                    this.progressValue = 50;

                    this.placesService.getWeatherData(this.latitude, this.longitude).subscribe((response: any) => {
                        // console.log(response);
                        this.weather_info = response.data;

                        if(response.data) {
                            this.progressValue = 100;
                        }
                        else this.progressValue = 0;

                        if(this.progressValue == 0){
                            this.isInvalid = true;
                        }
                        else{
                            setTimeout(()=>{this.isProgressBar = false;}, 1000);
                            this.isSearch = true;
                            this.favorite_count = this.favorite_count + 1;
                        }
                    })
                }else{
                    this.progressValue = 0;
                    this.isInvalid = true;
                }
            })
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    createForm() {
        this.angForm = this.fb.group({
            street: ['', Validators.required ],
            city: ['', Validators.required ],
            state: ['', Validators.required ],
            currentLocation: ['']
        });
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    onOptionsHourly(event){
        let value = event.target.value;
        var graph_data = [];
        if(value == "Temperature")
        {
            for(var n=0; n < 24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].temperature);
            }

            this.draw_hourly_graphs(graph_data, "Temperature", "Time difference from current hour","Fahrenheit");
        } 
        else if (value == "Pressure" ) {
            for(var n=0; n<24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].pressure);
            }
            this.draw_hourly_graphs(graph_data, "Pressure","Time difference from current hour","Millibars");
        }
        else if (value == "Humidity" ) {
            for(var n=0; n<24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].humidity);
            }
            this.draw_hourly_graphs(graph_data, "Humidity","Time difference from current hour","% Humidity");
        }
        else if (value == "Ozone" ) {
            for(var n=0; n<24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].ozone);
            }
            this.draw_hourly_graphs(graph_data, "Ozone","Time difference from current hour","Dobson Units");
        }
        else if (value == "Visibility" ) {
            for(var n=0; n<24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].visibility);
            }
            this.draw_hourly_graphs(graph_data, "Visibility","Time difference from current hour","Miles (Maximum 10)");
        }
        else if (value == "Wind speed" ) {
            for(var n=0; n<24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].windSpeed);
            }
            this.draw_hourly_graphs(graph_data, "Wind speed","Time difference from current hour","Miles per Hour");
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    draw_hourly_graphs(graph_data, caption, xLabel, yLabel)
    {
        var m_label = [];
        for(var n=0; n<24; n++)
        {
            m_label.push(n.toString());
        }

        this.chartData = [
            { 
                data: graph_data, 
                label: caption,
            },
        ];
        this.chartLabels = m_label;

        this.chartOptions = { 
            responsive: true ,
            scales: {
                yAxes: [{ 
                    scaleLabel: { display: true, labelString:  yLabel}
                }], 
                xAxes: [{
                    scaleLabel: { display: true, labelString: xLabel}
                }]
            }
        };
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    draw_weeklyChart()
    {
        var rangeBarData = [];
        for (var i = 0; i <= 7; i ++) {
            var date = new Date(parseInt(this.weather_info.daily.data[i].time)*1000);
            rangeBarData.push({
                x: new Date(date.getFullYear(),date.getMonth(),date.getDate()), y:[this.weather_info.daily.data[i].temperatureLow, this.weather_info.daily.data[i].temperatureHigh],label:CanvasJS.formatDate( date, "DD/MM/YYYY").toString()
            });
        }

        var that = this;

        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            // exportEnabled: true,
            title: {
                text: "Weekly Weather"
            },
            dataPointMaxWidth: 13,
            legend: {
                horizontalAlign: "center", // left, center ,right 
                verticalAlign: "top",  // top, center, bottom
              },

            axisX: {
                interval: 1,
			    valueFormatString: "DD/MM/YYYY",
                title: "Days"
            },
            axisY: {
                includeZero: false,
                title: "Temperature In Fahrenheit",
                interval: 10,
                gridThickness: 0
                // suffix: "k",
                // prefix: "$"
            }, 
            data: [{   
                click: function(e){
                    // console.log(e);
                    that.selectedDate_index = e.dataPointIndex;
                    that.selected_date = CanvasJS.formatDate( e.dataPoint.x, "DD/MM/YYYY").toString();
                    if(that.weather_info.daily.data[that.selectedDate_index].icon=="clear-day" || that.weather_info.daily.data[that.selectedDate_index].icon=="clear-night" )
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sun-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="rain")
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/rain-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="snow")
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/snow-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="sleet")
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/lightning-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="wind")
                    {
                        that.weatherIcon_URL = "https://cdn4.iconfinder.com/data/icons/the-weather-is-nicetoday/64/weather_10-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="fog" || that.weather_info.daily.data[that.selectedDate_index].icon=="cloudy")
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/cloudy-512.png";
                    }else if(that.weather_info.daily.data[that.selectedDate_index].icon=="partly-cloudy-day" || that.weather_info.daily.data[that.selectedDate_index].icon=="partly-cloudy-night")
                    {
                        that.weatherIcon_URL = "https://cdn3.iconfinder.com/data/icons/weather-344/142/sunny-512.png";
                    }

                    that.modalService.open(that.modalContent, {ariaLabelledBy: 'modal-basic-title'});   

                  },
                color: "#77accad1",
                type: "rangeBar",
                showInLegend: true,
                // yValueFormatString: "#0.#",//"$#0.#K",
                indexLabel: "{y[#index]}",
                legendText: "Day wise temperature range",
                toolTipContent: "<b>{label}</b>: {y[0]} to {y[1]}",
                dataPoints:rangeBarData
            }]
        });
        chart.render();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    onResult(){
        this.resultBtn_flag = true;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    onFavorite(){
        this.resultBtn_flag = false;

    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    tabChangeEvent($event) {
        if ($event.nextId == 'tab3') {
            setTimeout(()=>{this.draw_weeklyChart()}, 300);
        }else if($event.nextId == 'tab2')
        {
            var graph_data = [];
            for(var n=0; n < 24; n++)
            {
                graph_data.push(this.weather_info.hourly.data[n].temperature);
            }
            this.draw_hourly_graphs(graph_data, "Temperature", "Time difference from current hour","Fahrenheit");
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    removeFavorite(){
        this.favoriteList.splice(this.selectedDate_index,1);
        this.isFavorite = !this.isFavorite;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    removeFavoriteData(ev)
    {
        // console.log(ev);
        let selectedDate_index = parseInt(ev.target.id);
        // console.log(selectedDate_index);
        this.favoriteList.splice(selectedDate_index,1);
        this. onFavorite();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    setFavoriteData(ev)
    {
        this.selectedDate_index = parseInt(ev.target.id);
        this.isSearch = true;
        this.state_seal_URL = this.favoriteList[this.selectedDate_index].imgURL;
        this.city = this.favoriteList[this.selectedDate_index].city;

        var state1 = "";
        for(var n=0; n<this.stateList.length; n++)
        {
            if(this.favoriteList[this.selectedDate_index].state == this.stateList[n].code)
            {
                state1 = this.stateList[n].name;
                break;
            }
        }

        this.state = state1;
        this.weather_info = this.favoriteList[this.selectedDate_index].weather_info;
        this.isFavorite = true;
        this.onResult();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    addFavorite() {
        // console.log(this.stateList);
        if(this.isSearch) this.selectedDate_index = this.favoriteList.length;

        var state1 = "";
        for(var n=0; n<this.stateList.length; n++)
        {
            if(this.state == this.stateList[n].name)
            {
                state1 = this.stateList[n].code;
                break;
            }
        }

        this.favoriteList.push({
            id: this.favorite_count,
            imgURL: this.state_seal_URL,
            city: this.city,
            state: state1,
            weather_info: this.weather_info,
        });

        this.isFavorite = !this.isFavorite;
        // console.log(this.favoriteList);        
    }
}

    
