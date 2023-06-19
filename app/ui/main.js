const ctxTemp = document.getElementById('temperatureChart');
const ctxPID= document.getElementById('pidChart');
const ctxOn = document.getElementById('onChart');

log_labels = [];
temperature= [];
temperature_avg= [];
temperature_exp= [];
temperature_kalman= [];
pd_data = [];
pi_data = [];
pp_data = [];
pid_data = [];
target_temperature_data = [];
is_heating_data = [];
duty_cycle_data = [];
activated_data = [];


n = 0;
 
const autocolors = window['chartjs-plugin-autocolors'];

Chart.register(autocolors);

const temperatureChart = new Chart(ctxTemp, {
    type: 'line',
    data: {
        labels : log_labels,
        datasets: [
            {
                label: 'Temperatur',
                data: temperature
                // borderWidth: 2,
                // tension: 0.1
            },
            {
                label: 'Temperatur AVG',
                data: temperature_avg
                // borderWidth: 2,
                // tension: 0.1
            },
            {
                label: 'Temperatur Exp',
                data: temperature_avg
                // borderWidth: 2,
                // tension: 0.1
            },
            {
                label: 'Temperatur Kalman',
                data: temperature_avg
                // borderWidth: 2,
                // tension: 0.1
            },
            {
                label: 'Target Temperature',
                data: target_temperature_data
                // borderWidth: 3
            }
        ]
    },
    options: {
        elements: {
            point:{
                radius: 0
            }
        },
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }
        }
    }
});

const PIDChart = new Chart(ctxPID, {
    type: 'line',
    data: {
        labels : log_labels,
        datasets: [
            {
                label: 'PD',
                data: pd_data,
                borderWidth: 5,
                tension: 0.1,
            },
            {
                label: 'PP',
                data: pp_data,
                borderWidth: 5,
                tension: 0.1,
            },
            {
                label: 'PI',
                data: pi_data,
                borderWidth: 5,
                tension: 0.1,
            },
        ]
    },
    options: {
        elements: {
            point:{
                radius: 0
            }
        },
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }
        }
    }
});

const onChart = new Chart(ctxOn, {
    type: 'line',
    data: {
        labels : log_labels,
        datasets: [{
            label: 'Duty Cycle',
            data: pid_data,
            borderWidth: 5,
            tension: 0.1
        },
            {
                label: 'Is Heating',
                data: is_heating_data,
                borderWidth: 5,
                tension: 0.1,
            },
            {
                label: 'Is activated',
                data: activated_data,
                borderWidth: 5,
                tension: 0.1,
            },
        ]
    },
    options: {
        elements: {
            point:{
                radius: 0
            }
        },
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }
        }
    }
});

const getTemperature = async () => {
    const response = await fetch('http://localhost:8080/log', {method: 'GET'});
    const data = await response.json(); 

    if (data.temperature.length > n){
        for (let i = n; i < data.temperature.length; i++) {
            temperature.push(data.temperature[i]);
            temperature_avg.push(data.temperatureAvg[i]);
            temperature_exp.push(data.temperatureExp[i]);
            temperature_kalman.push(data.temperatureKalman[i]);
            log_labels.push(data.timestamp[i]);
            target_temperature_data.push(data.target_temperature[i]);
            pd_data.push(data.pd_gain_scaled[i]);
            pi_data.push(data.pi_gain_scaled[i]);
            pid_data.push(data.pid_gain[i]);
            pp_data.push(data.pp_gain_scaled[i]);

            is_heating_data.push(data.is_heating[i]);
            activated_data.push(data.is_activated[i]);
            duty_cycle_data.push(data.duty_cycle[i]);
        }
        n = data.temperature.length;
    }


    temperatureChart.update();
    PIDChart.update();
    onChart.update();

}
setInterval(getTemperature, 1000);

const postControl = async () => {

    fetch('http://localhost:8080/control', {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
            ip: document.getElementById('esp_ip').value,
            override_pid: Number(document.getElementById('override_pid').value) == 1,
            target_temperature: document.getElementById('target_temp').value,
            is_activated: Number(document.getElementById('is_activated').value) == 1,
            k_p: document.getElementById('kp').value,
            t_i: document.getElementById('ti').value,
            t_d: document.getElementById('td').value,
        })})
}

document.getElementById("submitButton").addEventListener("click", postControl);

