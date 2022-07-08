//  -------------------------------------------------------------
//  author        Giga
//  project       qeeqbox/raven
//  email         gigaqeeq@gmail.com
//  description   raven
//  licensee      AGPL-3.0
//  -------------------------------------------------------------
//  contributors list qeeqbox/raven/graphs/contributors
//  -------------------------------------------------------------
//      "browser": true,
//      "commonjs": true,
//      "jquery": true
//{disable_obfuscation_compression_all}//
//{disable_obfuscation_start}//


class qb_raven_map {
  constructor(svg_id) {
    this.svg_id = svg_id
  }

  init_all(options) {
    this.world_type = options.world_type
    this.selected_countries = options.selected_countries
    this.remove_countries = options.remove_countries
    this.height = options.height
    this.width = options.width
    this.orginal_background_color = options.backup_background_color
    this.orginal_country_color = options.orginal_country_color
    this.backup_background_color = options.backup_background_color
    this.backup_country_color = options.orginal_country_color
    this.clicked_country_color = options.clicked_country_color
    this.selected_country_color = options.selected_country_color
    this.global_timeout = options.global_timeout
    this.global_stats_limit = options.global_stats_limit
    this.db_length = options.db_length
    this.location = options.location
    this.panels = options.panels
    this.disable = options.disable
    this.websocket = options.websocket
    this.verbose = options.verbose
    this.qb_world_countries = {}
    this.qb_world_cities = {}
    this.qb_countries_codes = {}
    this.qb_companies_codes = []
    this.qb_ports_codes = []
    this.qb_ips_codes = []
    this.sensitivity = 75
    this.markers_queue = []
    this.db = []
    this.global_lock = false
    this.unknown_flag = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAWCAYAAABKbiVHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAEAQAABAEBy2R4jwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAF3SURBVEiJzZaxThtBEIa/XZ+hACQ7BQoSPIHlu9PpJCpQTLpQ0FDmBULDM4BEzVsg0QEvYFGlin0rZMlJZ4GgSRTT3eWyHgpAoqC6Xdn+q9UUnz7NzmhXZVn2F2gw+4wDoFGv1xdbrda/WVkMBoOFsiwLPSuB9xK4Aowxq1rrj0VRjNI0fZy6zHA4XMnz/BA4EJE1ay1BEGCMuSzL8luapg9Tk8nzPAKOgAul1DUwFpGvIrIXBMEHYHtqMpPJ5FZrncZx3H+tdbvds2azOQC2jDHrURTdTUUmSZIRMHpb63Q6/40xf0QEpdRyFa63ber3+7sisqmU+t5ut39WYThvE0CWZR3gHHiw1u4rpaQKx7kzvV4vAq6AR2AnSZL7qiznzmitT4AlrfWnMAx/ObFcZYAW8DsMwx+uIB8ydaDwwHG/plqt9kVEKg2sdxlr7eeX440ry8dqHwMCnLqCfMiMeZZxjrNMHMcbPkTA43PgI3Mlo+bpQ/4E1wl785eim/kAAAAASUVORK5CYII="/>'
  }

  async init_world() {
    this.spinner_on_off(true, '[!] Initializing..')
    await this.load_scripts()

    $.fn.is_partially_visible = function() {
      try {
        return $(this).offset().top + $(this).outerHeight() <= $(window).scrollTop() + $(window).height()
      } catch (err) {
        return false
      }
    }

    this.spinner_on_off(true, '[!] Init interface')
    this.setup_task_bar()
    this.setup_raven_multi_output_panel()
    this.setup_raven_single_output_panel()
    this.setup_raven_insert_panel()
    this.setup_raven_tooltip_panel()
    this.setup_raven_random_panel()
    this.startup_windwos()
    this.verbose && console.log('Init qb_worldmap')
    this.projection = d3.geoEquirectangular().scale(this.width / 2 / Math.PI).translate([this.width / 2, this.height / 2]).rotate([0])
    this.org_scale = this.projection.scale()
    this.path = d3.geoPath(this.projection).pointRadius(1.5)
    this.svg = d3.select(this.svg_id).append('svg')
      .attr('height', this.height)
      .attr('width', this.width)
    this.svg.call(d3.drag().on('drag', () => {
        const rotate = this.projection.rotate()
        const k = this.sensitivity / this.projection.scale()
        this.projection.rotate([
          rotate[0] + d3.event.dx * k // horizontal only
          // rotate[1] - d3.event.dy * k  //disable vertical
        ])
        this.svg.selectAll('path').attr('d', this.path)
        this.svg.selectAll('.raven-worldmap-route').attr('d', this.curved_marker)
      }))
      .call(d3.zoom().scaleExtent([1, 5]).on('zoom', () => {
        this.projection.scale(this.org_scale * d3.event.transform.k)
        this.svg.selectAll('path').attr('d', this.path)
        this.svg.selectAll('.raven-worldmap-route').attr('d', this.curved_marker)
      }))

    this.custom_curve = function(context) {
      const custom = d3.curveLinear(context)
      custom._context = context
      custom.point = function(x, y) {
        x = +x
        y = +y
        switch (this._point) {
          case 0:
            this._point = 1
            this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y)
            this.x0 = x
            this.y0 = y
            break
          case 1:
            this._point = 2
          default:
            if (Math.sqrt(Math.pow((x - this.x0), 2) + Math.pow((y - this.y0), 2)) < 80) {
              this._context.quadraticCurveTo((x * 0.5) + (this.x0 * 0.5), (y * 0.5) + (this.y0 * 0.5), x, y)
            } else {
              this._context.quadraticCurveTo((x * 0.5) + (this.x0 * 0.5), (y * 0.5) + (this.y0 * 0.5) - 100, x, y) // -100 for curve
            }
            this.x0 = x
            this.y0 = y
            break
        }
      }
      return custom
    }

    this.curved_marker = d3.line()
      .curve(this.custom_curve)
      .x((d) => {
        return this.projection([d[0], d[1]])[0]
      })
      .y((d) => {
        return this.projection([d[0], d[1]])[1]
      })

    this.q_tween_start = function() {
      return (t) => {
        const l = this.getTotalLength()
        d3.select(this).attr('stroke-dasharray', l)
        d3.select(this).attr('stroke-dashoffset', d3.interpolateNumber(l, 0)(t))
      }
    }

    this.q_tween_end = function() {
      return (t) => {
        const l = this.getTotalLength()
        d3.select(this).attr('stroke-dasharray', l)
        d3.select(this).attr('stroke-dashoffset', '-' + d3.interpolateNumber(0, l)(t))
      }
    }

    this.delay = x => new Promise(y => setTimeout(y, x))

    this.current_time = () => new Date().toJSON().replace('T', ' ')

    this.get_nested_value = (dict, ...args) => {
      try {
        return args.reduce((dict, key) => dict && dict[key], dict)
      } catch (err) {
        return undefined
      }
    }

    this.group_by_key = (obj, x) => {
      return obj.reduce(function(_obj, _x) {
        _obj[_x[x]] = _obj[_x[x]] || 0
        _obj[_x[x]] += 1
        return _obj
      }, {})
    }

    d3.select(window)
      .on('resize', (e) => this.size_changed(e))

    await this.fetch_data()
    this.spinner_on_off(false)
  }

  async fetch_data() {
    this.verbose && console.log('Fetch countries and cities')
    await Promise.all([
        this.qb_world_countries = (topojson.feature(qb_world_countries, qb_world_countries.objects.countries).features).filter(obj => !this.remove_countries.includes(obj.properties.cc)),
        this.qb_world_cities = qb_world_cities,
        this.qb_private_ips_codes = qb_private_ips_codes,
        this.qb_countries_codes = qb_countries_codes,
        this.qb_companies_codes = qb_companies_codes,
        this.qb_ports_codes = qb_ports_codes,
        this.qb_ips_codes = qb_ips_codes
      ]).then(() => {
        if (this.qb_countries_codes && this.qb_world_countries) {
          this.draw()
        } else {
          this.verbose && console.log('qb_world_countries and qb_countries_codes modules are needed')
        }
      })
      .catch(error => this.verbose && console.log(error));
  }

  async load_scripts() {
    var loaded = []
    var filtered = ['qb_world_countries', 'qb_companies_codes', 'qb_countries_codes', 'qb_ips_codes', 'qb_world_cities', 'qb_ports_codes'].filter(item => !this.disable.includes(item))
    new Promise(() => {
      filtered.forEach((item) => {
        if (typeof(window[item]) === "undefined" && !loaded.includes(item)) {
          this.spinner_on_off(true, '[!] Loading: ' + item)
          $.holdReady(true);
          $.getScript(this.location + '/' + item + '.js', function() {
            $.holdReady(false);
            loaded.push(item)
          });
        }
      })
    }).catch(error => this.verbose && console.log(error));

    let wait_until_scripts_loaded = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          var dobule_check = []
          if (loaded.sort().toString() == filtered.sort().toString()) {
            filtered.forEach((item) => {
              if (typeof([item]) !== "undefined") {
                this.spinner_on_off(true, '[!] Loaded: ' + item)
                dobule_check.push(item)
              }
            });

            if (dobule_check.sort().toString() == filtered.sort().toString()) {
              if (this.disable.includes('qb_companies_codes')) {
                window['qb_companies_codes'] = []
              }
              if (this.disable.includes('qb_ips_codes')) {
                window['qb_private_ips_codes'] = []
                window['qb_ips_codes'] = []
              }
              if (this.disable.includes('qb_ports_codes')) {
                window['qb_ports_codes'] = []
              }
              if (this.disable.includes('qb_world_cities')) {
                window['qb_world_cities'] = {}
              }
              return resolve()
            }
          } else {
            reject()
          }
        }, 100);
      }).catch(() => wait_until_scripts_loaded());
    }

    await wait_until_scripts_loaded()
    return 1
  }

  draw() {
    this.svg.append('path')
      .datum({
        type: 'Sphere'
      })
      .attr('class', 'raven-worldmap-water')
      .attr('d', this.path)

    this.svg.selectAll('.raven-worldmap-country')
      .data(this.qb_world_countries)
      .enter().insert('path')
      .attr('class', 'raven-worldmap-country')
      .attr('d', this.path)
      .attr('id', function(d) {
        return 'raven-worldmap-country-' + d.properties.cc
      })
      .on('click', (d) => {
        !this.disable.includes('move_to_country') && this.move_to_country('cc', d.properties.cc, this.global_timeout, this.global_stats_limit)
      })
  }

  size_changed() {
    try {
      const _width = document.getElementById(this.svg_id.substring(1)).clientWidth
      this.svg.attr('width', _width)
      this.projection.translate([_width / 2, this.height / 2])
      this.svg.selectAll('.raven-worldmap-country').attr('d', this.path)
      this.svg.selectAll('.raven-worldmap-city').attr('d', this.path)
      this.svg.selectAll('.raven-worldmap-route').attr('d', this.curved_marker)
    } catch (err) {
      this.verbose && console.log(err)
    }
  }

  move_to_country(method, country, timeout, stats_limit) {
    let target_country
    let return_info = {}
    let temp_ip_info = []
    try {
      if (method === 'cc') {
        this.verbose && console.log('move to {country}'.replace('{country}', country))
        if (this.qb_world_countries !== null) {
          target_country = this.qb_world_countries.find(obj => {
            return obj.properties.cc === country
          })
          if (target_country) {
            if (target_country.properties.cc in this.qb_countries_codes) {
              return_info = JSON.parse(JSON.stringify(this.qb_countries_codes[target_country.properties.cc]))
            }
          }
        }
      }
      if (method === 'detect') {
        this.verbose && console.log('move to {country}'.replace('{country}', country))
        let ip_address_and_port = country.split(':')
        let is_private = this.filter_by_ip(this.qb_private_ips_codes, ip_address_and_port[0])
        if (is_private && typeof is_private === 'object') {
          if (ip_address_and_port.length === 2) {
            ip_address_and_port[1] = parseInt(ip_address_and_port[1])
            let results = JSON.parse(JSON.stringify(this.qb_ports_codes.find(item => item.p === ip_address_and_port[1])))
            if (results && typeof results === 'object') {
              return_info['p'] = results
            }
          }
          return_info['i'] = is_private.i
          return [null, return_info]
        } else {
          target_country = this.filter_by_ip(this.qb_ips_codes, ip_address_and_port[0])
          temp_ip_info = this.filter_by_ip_with_info(this.qb_companies_codes, ip_address_and_port[0])
          if (target_country && typeof target_country === 'object') {
            target_country = this.qb_world_countries.find(obj => {
              return obj.properties.cc === target_country.cc
            })

            if (target_country) {
              if (target_country.properties.cc in this.qb_countries_codes) {
                return_info = JSON.parse(JSON.stringify(this.qb_countries_codes[target_country.properties.cc]))
              }

              if (temp_ip_info && typeof temp_ip_info === 'object') {
                return_info.co = temp_ip_info.info
              }

              if (ip_address_and_port.length === 2) {
                ip_address_and_port[1] = parseInt(ip_address_and_port[1])
                let results = this.qb_ports_codes.find(item => item.p === ip_address_and_port[1])
                if (results && typeof results === 'object') {
                  return_info.p = results
                }
              }
            }
          }
        }
      }

      if (typeof target_country !== 'undefined' && 'type' in target_country) {
        if (method !== 'detect_222') {
          this.get_db_stats(target_country.properties.cc, stats_limit)
          $('#raven-tooltip-panel').dialog('open')
        }

        d3.transition()
          .delay(180)
          .duration(1000)
          .tween('rotate', () => {
            const point = d3.geoCentroid(target_country)
            const rotate = d3.interpolate(this.projection.rotate(), [-point[0], -point[1]])
            return (x) => {
              this.projection.rotate(rotate(x))
              this.svg.selectAll('.raven-worldmap-country').attr('d', this.path)
              this.svg.selectAll('.raven-worldmap-city').attr('d', this.path)
              this.svg.selectAll('.raven-worldmap-route').attr('d', this.curved_marker)
            }
          })
          .transition()

        d3.select('#raven-worldmap-country-' + target_country.properties.cc)
          .transition()
          .duration(timeout)
          .style('fill', this.clicked_country_color)
          .transition()
          .duration(timeout)
          .style('fill', this.orginal_country_color)

        return [target_country, return_info]
      }
    } catch (err) {
      this.verbose && console.log(err)
    }

    return [null, null]
  }

  add_marker_by_gussing(marker_object, colors_object = {}, timeout = 5000, options = []) {
    const time_temp = this.current_time()
    const temp_colors_object = JSON.parse(JSON.stringify(colors_object))
    let temp_ip_info = []
    let temp_line_name = null
    let return_info = {
      from: marker_object.from,
      to: marker_object.to,
      active: false,
      from_method: '',
      to_method: '',
      from_result: false,
      to_result: false,
      time: time_temp
    }
    const temp_marker_object = {
      from: null,
      to: null
    }
    try {
      for (const item of ['from', 'to']) {
        if (typeof(marker_object[item]) === 'string' || object.from instanceof String){
          if (!marker_object[item].match(/\d/) && Object.keys(this.qb_countries_codes).length > 0 && Object.keys(this.qb_world_countries).length > 0){
            if (marker_object[item].indexOf(',') == -1) {
              if (marker_object[item] in this.qb_countries_codes) {
                temp_marker_object[item] = this.qb_countries_codes[marker_object[item]]
                return_info[item] = temp_marker_object[item]
                temp_marker_object[item] = this.qb_world_countries.find(obj => obj.properties.cc === temp_marker_object[item].cc)
                temp_marker_object[item] = d3.geoCentroid(temp_marker_object[item])
                temp_marker_object[item] = {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [temp_marker_object[item][0], temp_marker_object[item][1]]
                  }
                }
              }
            } else if (Object.keys(this.qb_world_cities).length > 0 && marker_object[item] in this.qb_world_cities) {
              temp_marker_object[item] = this.qb_world_cities[marker_object[item]]
              if (typeof temp_marker_object[item] === 'object' && temp_marker_object[item] !== null) {
                if (temp_marker_object[item].properties.cc in this.qb_countries_codes) {
                  delete return_info[item]
                  return_info[item] = JSON.parse(JSON.stringify(this.qb_countries_codes[temp_marker_object[item].properties.cc]))
                }

                return_info[item].c = temp_marker_object[item].properties.n
              }
            } else {
              temp_marker_object[item] = marker_object[item].split(',')
              if (temp_marker_object[item].length === 2) {
                if (temp_marker_object[item][1] in this.qb_countries_codes) {
                  temp_marker_object[item] = this.qb_countries_codes[temp_marker_object[item][1]]
                  return_info[item] = temp_marker_object[item]
                  temp_marker_object[item] = this.qb_world_countries.find(obj => obj.properties.cc === temp_marker_object[item].cc)
                  temp_marker_object[item] = d3.geoCentroid(temp_marker_object[item])
                  temp_marker_object[item] = {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [temp_marker_object[item][0], temp_marker_object[item][1]]
                    }
                  }
                }
              }
            }

            return_info[item + '_method'] = 'name'
          }
          else if (marker_object[item].match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) && this.qb_private_ips_codes.length > 0 && this.qb_ips_codes.length > 0 && this.qb_companies_codes.length > 0 && Object.keys(this.qb_countries_codes).length > 0 && this.qb_ports_codes.length > 0 && Object.keys(this.qb_world_countries).length > 0){
            let ip_address_and_port = marker_object[item].split(':')
            temp_marker_object[item] = this.filter_by_ip(this.qb_ips_codes, ip_address_and_port[0])
            temp_ip_info = this.filter_by_ip_with_info(this.qb_companies_codes, ip_address_and_port[0])
            let is_private = this.filter_by_ip(this.qb_private_ips_codes, ip_address_and_port[0])
            if (is_private && typeof is_private === 'object') {
              return_info[item] = {
                'ip': marker_object.from
              }
              if (ip_address_and_port.length === 2) {
                ip_address_and_port[1] = parseInt(ip_address_and_port[1])
                let results = JSON.parse(JSON.stringify(this.qb_ports_codes.find(item => item.p === ip_address_and_port[1])))
                if (results && typeof results === 'object') {
                  return_info[item]['p'] = results
                }
              }
              return_info[item]['i'] = is_private.i
            } else {
              if (typeof temp_marker_object[item] === 'object' && temp_marker_object[item]) {
                if (temp_marker_object[item].cc in this.qb_countries_codes) {
                  delete return_info[item]
                  return_info[item] = JSON.parse(JSON.stringify(this.qb_countries_codes[temp_marker_object[item].cc]))

                  if (temp_ip_info && typeof temp_ip_info === 'object') {
                    return_info[item].co = temp_ip_info.info
                  }

                  if (ip_address_and_port.length === 2) {
                    ip_address_and_port[1] = parseInt(ip_address_and_port[1])
                    let results = this.qb_ports_codes.find(item => item.p === ip_address_and_port[1])
                    if (results && typeof results === 'object') {
                      return_info[item].p = results
                    }
                  }

                  return_info[item].ip = marker_object[item]
                  temp_marker_object[item] = this.qb_world_countries.find(obj => obj.properties.cc === temp_marker_object[item].cc)
                  temp_marker_object[item] = d3.geoCentroid(temp_marker_object[item])
                  temp_marker_object[item] = {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [temp_marker_object[item][0], temp_marker_object[item][1]]
                    }
                  }
                }
              }
            }

            return_info[item + '_method'] = 'ip'
          }
          else if (marker_object[item].match(/([0-9.-]+).+?([0-9.-]+)/) && Object.keys(this.qb_countries_codes).length > 0){
            marker_object[item] = marker_object[item].split(",")
            if (options.includes('country-by-coordinate')) {
              let country = this.get_country_by_coordinate(marker_object[item][0], marker_object[item][1])
              if (country !== undefined) {
                if (country in this.qb_countries_codes) {
                  delete return_info[item]
                  return_info[item] = JSON.parse(JSON.stringify(this.qb_countries_codes[country]))
                }
              }
            }

            temp_marker_object[item] = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [marker_object[item][1], marker_object[item][0]]
              }
            }

            if (typeof return_info[item] === 'string') {
            return_info[item] = {
              coordinates: [marker_object[item][1], marker_object[item][0]]
            }
            }

            return_info[item + '_method'] = 'coordinates'

          }
        } 
      }

      if (options.includes('line')) {
        if (this.get_nested_value(temp_marker_object, 'from', 'geometry', 'coordinates')) {
          if (!temp_marker_object.from.geometry.coordinates.includes(NaN)) {
            return_info.from_result = true
          }
        }
        if (this.get_nested_value(temp_marker_object, 'to', 'geometry', 'coordinates')) {
          if (!temp_marker_object.to.geometry.coordinates.includes(NaN)) {
            return_info.to_result = true
          }
        }
        if (return_info.from_result && return_info.to_result) {
          temp_line_name = time_temp + '-line-' + return_info.method + JSON.stringify([temp_marker_object.from.geometry, temp_marker_object.to.geometry])
          if (!this.markers_queue.includes(temp_line_name)) {
            if (temp_colors_object.line.from === null) {
              temp_colors_object.line.from = this.random_bg_color()
            }
            if (temp_colors_object.line.to === null) {
              temp_colors_object.line.to = this.random_bg_color()
            }

            this.draw_line_mark(temp_marker_object.from, temp_marker_object.to, temp_colors_object.line.from, temp_colors_object.line.to, timeout, temp_line_name)
            return_info.active = true
          }
        } else {
          if ((typeof(return_info.from) === 'object') && (typeof(return_info.to) === 'object')) {
            return_info.active = true
            return_info.from_result = true
            return_info.to_result = true
          }
        }
      } else if (options.includes('point')) {
        if (this.get_nested_value(temp_marker_object, 'from', 'geometry', 'coordinates')) {
          if (!temp_marker_object.from.geometry.coordinates.includes(NaN)) {
            return_info.from_result = true
          }
        }
        if (return_info.from_result) {
          temp_line_name = time_temp + '-point-' + return_info.method + JSON.stringify([temp_marker_object.from.geometry])
          if (!this.markers_queue.includes(temp_line_name)) {
            if (temp_colors_object.line.from === null) {
              temp_colors_object.line.from = this.random_bg_color()
            }
            this.draw_point_mark(temp_marker_object.from, temp_colors_object.line.from, timeout, temp_line_name)
            return_info.active = true
          }
        } else {
          if ((typeof(return_info.from) === 'object')) {
            return_info.active = true
            return_info.from_result = true
          }
        }
      }
    } catch (err) {
      this.verbose && console.log(err)
    }

    if (!return_info.from_result) {
      return_info.from = marker_object.from
    }

    if (!return_info.to_result) {
      return_info.to = marker_object.to
    }

    return return_info
  }

  mark_a_country(country_code_3, color, timeout, temp_name) {
    this.verbose && console.log('Go to country {country_code_3}'.replace('{country_code_3}', country_code_3))
    this.svg.select('#raven-worldmap-country-' + country_code_3)
      .transition()
      .duration(timeout)
      .style('fill', color)
      .transition()
      .on('end', () => {
        const index = this.markers_queue.indexOf(temp_name)
        if (index > -1) {
          this.markers_queue.splice(index, 1)
          this.verbose && console.log(temp_name + ' was removed from markers_queue')
        }
      })
      .duration(timeout)
      .style('fill', this.orginal_country_color)
  }

  draw_point_mark(from, color_from, timeout, temp_name) {
    try {
      if ('geometry' in from && !document.hidden) {
        this.markers_queue.push(temp_name)
        this.svg.append('path')
          .attr('class', 'raven-worldmap-point')
          .datum([from.geometry.coordinates])
          .attr('d', this.curved_marker)
          .attr('stroke', color_from)
          .transition()
          .duration(timeout)
          .attr('opacity', 1)
          .transition()
          .on('end', () => {
            const index = this.markers_queue.indexOf(temp_name)
            if (index > -1) {
              this.markers_queue.splice(index, 1)
              this.verbose && console.log(temp_name + ' was removed from markers_queue')
            }
          })
          .duration(timeout)
          .attr('opacity', 0)
          .remove()
      }
    } catch (err) {
      this.verbose && console.log(err)
    }
  }

  draw_line_mark(from, to, color_from, color_to, timeout, temp_name) {
    try {
      if ('geometry' in from && 'geometry' in to && !document.hidden) {
        this.markers_queue.push(temp_name)
        this.svg.append('path')
          .attr('class', 'raven-worldmap-route')
          .datum([from.geometry.coordinates, to.geometry.coordinates])
          .attr('d', this.curved_marker)
          .attr('stroke', color_from)
          .attr('stroke-dasharray', function() {
            return this.getTotalLength()
          })
          .transition()
          .duration(timeout)
          .tween('qtween', this.q_tween_start)
          .transition()
          .on('end', () => {
            const index = this.markers_queue.indexOf(temp_name)
            if (index > -1) {
              this.verbose && this.markers_queue.splice(index, 1)
              this.verbose && console.log(temp_name + ' was removed from markers_queue')
            }
          })
          .attr('stroke', color_to)
          .duration(timeout)
          .tween('qtween', this.q_tween_end)
          .remove()
      }
    } catch (err) {
      this.verbose && console.log(err)
    }
  }

  filter_by_ip(in_array = [], ip = '') {
    try {
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
        const ip_int = ((((((+ip.split('.')[0]) * 256) + (+ip.split('.')[1])) * 256) + (+ip.split('.')[2])) * 256) + (+ip.split('.')[3])
        return in_array.find(item => item.from <= ip_int && item.to >= ip_int)
      }
    } catch (err) {
      this.verbose && console.log(err)
    }

    return undefined
  }

  filter_by_ip_with_info(in_array = [], ip = '') {
    try {
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
        const ip_int = ((((((+ip.split('.')[0]) * 256) + (+ip.split('.')[1])) * 256) + (+ip.split('.')[2])) * 256) + (+ip.split('.')[3])
        const found_items = in_array.find(item => {
          const found = item.data.find(ip_range => {
            return ip_int >= ip_range.from && ip_int <= ip_range.to
          })
          if (found && typeof found === "object") {
            return true
          } else {
            return false
          }
        })
        return found_items
      }
    } catch (err) {
      this.verbose && console.log(err)
    }

    return undefined
  }

  filter_by_key_value(in_array = [], query = {}) {
    try {
      const out_array = in_array.filter(item => {
        return Object.keys(query).every(filter => {
          return query[filter].toLowerCase() === item[filter].toLowerCase()
        })
      })

      return out_array[0]
    } catch (err) {
      this.verbose && console.log(err)
    }
    return null
  }

  get_country_by_coordinate(lat, lon) {
    var country = undefined
    var lat = parseFloat(lat)
    var lon = parseFloat(lon)
    this.qb_world_countries.some(function(feature) {
      if (feature.geometry.type == "MultiPolygon") {
        return feature.geometry.coordinates.some(function(polygon) {
          return polygon.some(function(pol) {
            let ret = false
            for (let i = 0, l = pol.length - 1; i < pol.length; l = i++) {
              if (((pol[i][1] > lat) != (pol[l][1] > lat)) && (lon < (pol[l][0] - pol[i][0]) * (lat - pol[i][1]) / (pol[l][1] - pol[i][1]) + pol[i][0])) {
                ret = !ret
              }
            }
            if (ret) {
              country = feature.properties.cc
            }
            return ret
          })
        })
      }
    })

    return country
  }

  random_bg_color() {
    const color_array = [0, Math.floor(Math.random() * 256), 255]
    for (let i = color_array.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [color_array[i], color_array[rand]] = [color_array[rand], color_array[i]]
    }
    return '#' + color_array.map(c => c.toString(16).padStart(2, '0')).join('')
  }

  spinner_on_off(on_off, msg = '') {
    try {
      if (on_off) {
        if (msg !== '') {
          document.getElementById("raven-waiting-msg").innerHTML = msg
          document.getElementById("raven-waiting-msg").style.display = 'block';
        } else {
          document.getElementById("raven-waiting-msg").style.display = 'none';
        }
        document.getElementById("raven-waiting").style.display = 'block';
        document.getElementById("raven-waiting-msg").style.display = 'block';
        document.getElementById("raven-waiting-box").style.display = 'block';
      } else {
        document.getElementById("raven-waiting-box").style.display = 'none';
        document.getElementById("raven-waiting").style.display = 'none';
        document.getElementById("raven-waiting-msg").style.display = '';
      }
    } catch (err) {
      this.verbose && console.log(err)
    }
  }

  setup_raven_multi_output_panel() {
    if (this.panels.includes('multi-output')) {
      $('#raven-multi-output-panel').dialog({
        width: 500,
        maxWidth: 500,
        autoOpen: false,
        position: {
          my: 'left bottom',
          at: 'left+40 bottom-40',
          of: window
        },
        closeText: '',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'raven-multi-output-panel',
        close: () => {
          this.disable_enable_item_taskbar(true, 'multi-output')
        }
      })

      const resize_observer = new ResizeObserver(() => {
        if ($('#raven-multi-output-panel').dialog('isOpen') === true) {
          if (!$('#raven-multi-output-panel').is_partially_visible()) {
            $('#raven-multi-output-panel').dialog('option', 'position', {
              my: 'left bottom',
              at: 'left+40 bottom-40',
              of: window,
              using: function(pos, ext) {
                $(this).animate({
                  top: pos.top
                }, 200)
              }
            })
          }
        }
      })

      resize_observer.observe($('#raven-multi-output-panel')[0])
    } else {
      $('#raven-multi-output-panel').hide()
      this.disable_enable_item_taskbar(false, 'multi-output')
    }
  }

  setup_raven_single_output_panel() {
    if (this.panels.includes('single-output')) {
      $("#raven-single-output-panel").css({
        "display": "flex"
      });
      /*
      $("#raven-single-output-panel").css({"display":"flex"});
      $('#raven-single-output-panel').dialog({
        width: "100%",
        maxWidth: 500,
        autoOpen: false,
        position: {
          my: 'center bottom',
          at: 'center bottom-100',
          of: window
        },
        closeText: '',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'raven-single-output-panel',
        close: () => {
          this.disable_enable_item_taskbar(true, 'single-output')
        }
      })
      $(".raven-single-output-panel .ui-dialog-titlebar").hide();
      */
    } else {
      $('#raven-single-output-panel').hide()
      //this.disable_enable_item_taskbar(false, 'single-output')
    }
  }

  setup_raven_insert_panel() {
    if (this.panels.includes('insert')) {
      $('#raven-insert-panel').dialog({
        width: 500,
        maxWidth: 500,
        autoOpen: false,
        position: {
          my: 'left bottom',
          at: 'left+40 bottom-40',
          of: window
        },
        closeText: '',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'raven-insert-panel',
        close: () => {
          this.disable_enable_item_taskbar(true, 'insert')
        }
      })

      $('#raven-insert-result').hide()

      $('body').on('click', '#raven-insert-button', () => {
        this.raven_insert_button($('#raven-insert-text').val())
      })

      $('body').on('keypress', '#raven-insert-text', (e) => {
        if (e.which == 13) {
          this.raven_insert_button($('#raven-insert-text').val())
          return false;
        }
      })

      const resize_observer = new ResizeObserver(() => {
        if ($('#raven-insert-panel').dialog('isOpen') === true) {
          if (!$('#raven-insert-panel').is_partially_visible()) {
            $('#raven-insert-panel').dialog('option', 'position', {
              my: 'left bottom',
              at: 'left+40 bottom-40',
              of: window,
              using: function(pos, ext) {
                $(this).animate({
                  top: pos.top
                }, 500)
              }
            })
          }
        }
      })

      resize_observer.observe($('#raven-insert-panel')[0])
    } else {
      $('#raven-insert-panel').hide()
      this.disable_enable_item_taskbar(false, 'insert')
    }

  }

  setup_raven_tooltip_panel() {
    if (this.panels.includes('tooltip')) {
      $('#raven-tooltip-panel').dialog({
        width: 500,
        maxWidth: 500,
        autoOpen: false,
        position: {
          my: 'center',
          at: 'center',
          of: window
        },
        closeText: '',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'raven-tooltip-panel'
      })
    } else {
      $('#raven-tooltip-panel').hide()
      this.disable_enable_item_taskbar(false, 'tooltip')
    }

  }

  setup_raven_random_panel() {
    if (this.panels.includes('random')) {
      $('#raven-random-panel').dialog({
        width: 500,
        maxWidth: 500,
        autoOpen: false,
        position: {
          my: 'left bottom',
          at: 'left+40 bottom-40',
          of: window
        },
        closeText: '',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'raven-random-panel',
        close: () => {
          this.disable_enable_item_taskbar(true, 'random')
        }
      })

      $('body').on('click', '.raven-random-panel input[type="button"]:not(#raven-random-generate-button)', (e) => {
        $(e.currentTarget).toggleClass("raven-random-button-active");
      })

      $('body').on('click', '.raven-random-panel #raven-random-generate-button', () => {
        let list_of_args = []
        $(".raven-random-button-active").each(function() {
          list_of_args.push($(this).val())
        });
        if (list_of_args.length > 0 && $('#raven-random-text').val() !== '' && $('#raven-random-timeout').val() !== '' && $('#raven-random-delay').val() !== '') {
          this.random_data(parseInt($('#raven-random-text').val()), parseInt($('#raven-random-timeout').val()), parseInt($('#raven-random-delay').val()), list_of_args)
        }
      })
    } else {
      $('#raven-random-panel').hide()
      this.disable_enable_item_taskbar(false, 'random')
    }
  }

  setup_task_bar() {
    if (this.panels.includes('taskbar')) {
      $('#taskbar-panel').dialog({
        position: {
          at: 'right top',
          my: 'right-40 top+40',
          of: window
        },
        closeText: '',
        width: 'auto',
        autoResize: true,
        modal: false,
        resizable: false,
        minHeight: 'auto',
        dialogClass: 'taskbar-panel'
      })

      $('body').on('click', '.taskbar-panel-body #multi-output', () => {
        $('#raven-multi-output-panel').dialog('open')
        this.disable_enable_item_taskbar(false, 'multi-output')
      })

      $('body').on('click', '.taskbar-panel-body #insert', () => {
        $('#raven-insert-panel').dialog('open')
        this.disable_enable_item_taskbar(false, 'insert')
      })

      $('body').on('click', '.taskbar-panel-body #random', () => {
        $('#raven-random-panel').dialog('open')
        this.disable_enable_item_taskbar(false, 'random')
        $('#raven-random-text').val('25')
        $('#raven-random-timeout').val('1000')
        $('#raven-random-delay').val('500')
      })

      $('body').on('click', '.taskbar-panel-body #reset', async () => {
        this.spinner_on_off(true, 'Resetting interface')
        this.global_lock = true
        this.db = []
        await this.delay(2000)
        this.reset_everything()
        this.global_lock = false
        this.spinner_on_off(false)
      })

      $('#global-country-color').on('input',
        () => {
          const color = $('#global-country-color').val()
          this.orginal_country_color = color
          $("path[id^='raven-worldmap-country']").each(function() {
            $(this).css({
              "fill": color,
              "stroke": "#313131"
            });
          });
        }
      );

      $('#global-background-color').on('input',
        () => {
          const color = $('#global-background-color').val()
          $("body").css({
            "background-color": color
          });
          $(".raven-worldmap-water").css({
            "fill": color,
            "stroke": color
          });
        }
      );

      $('#sun-style').on('click',
        () => {
          this.change_color('#AE9C86', '#C4E4ED')
        }
      );

      $('#moon-style').on('click',
        () => {
          this.change_color('#666666', '#252525')
        }
      );

      $('#half-moon-style').on('click',
        () => {
          this.change_color('#494949', '#252525')
        }
      );

      $('#global-background-color').val(this.orginal_background_color)
      $('#global-country-color').val(this.orginal_country_color)

      this.disable_enable_item_taskbar(true, 'random')
      //this.disable_enable_item_taskbar(true, 'single-output')
      this.disable_enable_item_taskbar(true, 'multi-output')
      this.disable_enable_item_taskbar(true, 'insert')

      if (!this.panels.includes('logo')) {
        $('#qeeqbox-logo').remove();
        $('#qeeqbox-logo-separator').remove();
      }
    }
  }

  change_color(country_color, background_color) {
    this.orginal_country_color = country_color
    $("path[id^='raven-worldmap-country']").each(function() {
      $(this).css({
        "fill": country_color,
        "stroke": "#313131"
      });
    });


    this.orginal_background_color = background_color
    $("body").css({
      "background-color": background_color
    });
    $(".raven-worldmap-water").css({
      "fill": background_color,
      "stroke": background_color
    });

    $('#global-background-color').val(this.orginal_background_color)
    $('#global-country-color').val(this.orginal_country_color)

  }

  startup_windwos() {
    //this.panels.includes('insert') && $('#raven-insert-panel').dialog('open')
  }

  reset_everything() {
    this.panels.includes('insert') && $('#raven-insert-panel').dialog('close')
    this.panels.includes('insert') && $('#raven-insert-text').val('')
    this.panels.includes('insert') && $('#raven-insert-result').hide()
    this.panels.includes('multi-output') && $('#raven-multi-output-panel-body-table').html('')
    this.panels.includes('multi-output') && $('#raven-multi-output-panel').dialog('close')
    this.panels.includes('single-output') && $('#raven-single-output-panel-body').html('')
    this.panels.includes('random') && $('#raven-random-panel').dialog('close')

    $('#global-background-color').val(this.backup_background_color)
    $('#global-country-color').val(this.backup_country_color)

    const color_1 = $('#global-country-color').val()
    this.orginal_country_color = color_1
    $("path[id^='raven-worldmap-country']").each(function() {
      $(this).css({
        "fill": color_1,
        "stroke": "#313131"
      });
    });


    const color_2 = $('#global-background-color').val()
    this.orginal_background_color = color_2

    $("body").css({
      "background-color": color_2
    });
    $(".raven-worldmap-water").css({
      "fill": color_2,
      "stroke": color_2
    });

  }

  disable_enable_item_taskbar(add, name) {
    try {
      if (this.panels.includes('taskbar')) {
        if (add) {
          switch (name) {
            case 'single-output':
              $('.taskbar-panel-body').prepend('<div id="single-output" ><i class="fa fa-single-table" aria-hidden="true"></i></div>')
              break
            case 'multi-output':
              $('.taskbar-panel-body').prepend('<div id="multi-output" ><i class="fa fa-table" aria-hidden="true"></i></div>')
              break
            case 'insert':
              $('.taskbar-panel-body').prepend('<div id="insert" ><i class="fa fa-pencil-square-o" aria-hidden="true"></i></div>')
              break
            case 'random':
              $('.taskbar-panel-body').prepend('<div id="random" ><i class="fa fa-random" aria-hidden="true"></i></div>')
              break
            case 'setting':
              $('.taskbar-panel-body').append('<div id="setting" ><i class="fa fa-cog" aria-hidden="true"></i></div>')
              break
          }
        } else {
          $('.taskbar-panel-body #' + name).remove()
        }

        window.addEventListener('resize', () => {
          $('#taskbar-panel').dialog('option', 'position', {
            at: 'right top',
            my: 'right-40 top+40',
            of: window
          })
        })

        $('#taskbar-panel').dialog('option', 'position', {
          at: 'right top',
          my: 'right-40 top+40',
          of: window
        })
      }
    } catch (err) {
      this.verbose && console.log(err)
    }
  }

  raven_insert_button(input) {
    const result = this.move_to_country('detect', input, 2000)
    let result_row = ''
    if (result[1] && JSON.stringify(result[1]) !== '{}') {
      if ('f' in result[1]) {
        if (result[1].f !== '') {
          result_row += '<img src="data:image/png;base64,' + result[1].f + '"/>'
        }
      }
      if ('n' in result[1]) {
        if (result[1].n !== '') {
          result_row += 'Country: ' + result[1].n + '<br>'
        }
      }
      if ('co' in result[1]) {
        if (result[1].co !== '') {
          result_row += 'Whois: ' + result[1].co + '<br>'
        }
      }
      if ('i' in result[1]) {
        if (result[1].i !== '') {
          result_row += 'Private IP: ' + result[1].i + '<br>'
        }
      }
      if ('p' in result[1]) {
        result_row += 'Port info: ' + result[1].p.n + ' ' + result[1].p.p + '/' + result[1].p.t
      }

      $('#raven-insert-result').html(result_row)
      $('#raven-insert-result').show()
    } else {
      $('#raven-insert-result').html('Unknown, please insert valid input')
      $('#raven-insert-result').hide()
    }
  }

  add_to_db(row) {
    if (this.db.length > this.db_length) {
      this.db.shift()
    }
    this.db.push(row)
  }

  add_to_data_to_table(object, color, timeout, options = [], custom = null) {
    let ret_value = false
    let attack_event = {}
    try {

      attack_event = this.add_marker_by_gussing(object, color, timeout, options)

      if ('active' in attack_event) {
        if (attack_event.from_result || attack_event.to_result) {
          const action = '⮕'
          const temp_item = {
            from: {
              flag: this.unknown_flag,
              info: []
            },
            to: {
              flag: this.unknown_flag,
              info: []
            }
          }
          //need to change for single
          if (options.includes('multi-output')) {
            if ($('#raven-multi-output-panel-body-table').children().length > 10) {
              $('#raven-multi-output-panel-body-table .country-row:first').remove()
            }
          }

          ['from', 'to'].forEach((item) => {
            let normal = true
            if (typeof attack_event[item] === 'object' && attack_event[item] !== null) {
              if ('f' in attack_event[item]) {
                if (attack_event[item].f !== '') {
                  temp_item[item].flag = '<img src="data:image/png;base64,' + attack_event[item].f + '"/>'
                }
              }
              if (custom) {
                if (custom[item]) {
                  normal = false
                  for (const [key, value] of Object.entries(custom[item])) {
                    temp_item[item].info.push(key + ': ' + value)
                  }
                }
              }
              if (normal) {
                if ('ip' in attack_event[item]) {
                  if (attack_event[item].ip !== '') {
                    temp_item[item].info.push('IP: ' + attack_event[item].ip)
                  }
                }
                if ('i' in attack_event[item]) {
                  if (attack_event[item].i !== '') {
                    temp_item[item].info.push('Private IP: ' + attack_event[item].i)
                  }
                }
                if ('p' in attack_event[item]) {
                  temp_item[item].info.push('Port info: ' + attack_event[item].p.n + ' ' + attack_event[item].p.p + '/' + attack_event[item].p.t)
                }
                if ('co' in attack_event[item]) {
                  if (attack_event[item].co !== '') {
                    temp_item[item].info.push('Whois: ' + attack_event[item].co)
                  }
                }
                if ('c' in attack_event[item]) {
                  if (attack_event[item].c !== '') {
                    temp_item[item].info.push('City: ' + attack_event[item].c)
                  }
                }
                if ('n' in attack_event[item]) {
                  if (attack_event[item].n !== '') {
                    temp_item[item].info.push('Country: ' + attack_event[item].n)
                  }
                }
                if ('coordinates' in attack_event[item]) {
                  if (attack_event[item].coordinates.length == 2) {
                    temp_item[item].info.push('Latitude: ' + attack_event[item].coordinates[0])
                    temp_item[item].info.push('Longitude: ' + attack_event[item].coordinates[1])
                  }
                }
              }
            } else {
              temp_item[item].info.push('Unknown: ' + attack_event[item])
            }
          })

          if (attack_event.from_result && attack_event.to_result) {
            if (options.includes('multi-output')) {
              $('#raven-multi-output-panel-body-table').append('<div class="country-row"><div class="time">' + attack_event.time + '</div><div class="country-flag">' + temp_item.from.flag + '</div><div class="country-info">' + temp_item.from.info.join('<br>') + '</div><div class="action">' + action + '</div><div class="country-flag">' + temp_item.to.flag + '</div><div class="country-info">' + temp_item.to.info.join('<br>') + '</div></div>')
            }
            if (options.includes('single-output')) {
              $('#raven-single-output-panel-body').html('<div class="country-row"><div class="time">' + attack_event.time + '</div><div class="country-flag">' + temp_item.from.flag + '</div><div class="country-info-full-width">' + temp_item.from.info.join('<br>') + '</div><div class="action">' + action + '</div><div class="country-flag">' + temp_item.to.flag + '</div><div class="country-info-full-width">' + temp_item.to.info.join('<br>') + '</div></div>')
            }
          } else if (attack_event.from_result && !attack_event.to_result) {
            if (options.includes('multi-output')) {
              $('#raven-multi-output-panel-body-table').append('<div class="country-row"><div class="time">' + attack_event.time + '</div><div class="country-flag">' + temp_item.from.flag + '</div><div class="country-info">' + temp_item.from.info.join('<br>') + '</div></div>')
            }
            if (options.includes('single-output')) {
              $('#raven-single-output-panel-body').html('<div class="country-row"><div class="time">' + attack_event.time + '</div><div class="country-flag">' + temp_item.from.flag + '</div><div class="country-info-full-width">' + temp_item.from.info.join('<br>') + '</div></div>')
            }
          }

          if (typeof attack_event.from === 'object' && attack_event.from !== null && typeof attack_event.to === 'object' && attack_event.to !== null) {
            if ('n' in attack_event.from && 'n' in attack_event.to) {
              if (attack_event.from.n !== '' && attack_event.to.n !== '') {
                //this.add_to_db(attack_event.from.cc + ',' + attack_event.to.cc)
                ret_value = true
              }
            }
          }

        } else {
          this.verbose && console.log('Something wrong..', attack_event)
        }
      }
    } catch (err) {
      this.verbose && console.log(err)
    }

    return ret_value
  }

  fetch_data_from_server() {
    var is_socket_open = false
    var fetch_data_from_server_routine = () => {
      var wb = new WebSocket(this.websocket.server)
      return new Promise((resolve, reject) => {
        wb.onopen = () => {
          is_socket_open = true
          resolve(is_socket_open)
        }
        wb.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            parsed.forEach((item) => {
              if (item['function'] == 'table') {
                this.add_to_data_to_table(item['object'], item['color'], item['timeout'], item['options'], item['custom'])
              } else if (item['function'] == 'marker') {
                  
                this.add_marker_by_gussing(item['object'], item['color'], item['timeout'], item['options'])

              }
            });
          } catch (err) {
            this.verbose && console.log(err)
          }
        }
        wb.onerror = (e) => {
          is_socket_open = false
          reject(e)
        }
        wb.onclose = (e) => {
          is_socket_open = false
          reject(e)
        }
      }).catch(error => this.verbose && console.log(error));
    }

    setInterval(() => {
      if (!is_socket_open) {
        fetch_data_from_server_routine()
      }
    }, this.websocket.request_timeout)
  }

  async random_data(m, timeout, delay, type_of_data) {
    $('#raven-multi-output-panel-body-table').html('')
    const max_len_world_cities = Object.keys(this.qb_world_cities).length;
    const max_len_world_countries = this.qb_world_countries.length
    const type_of_data_length = type_of_data.length
    const random_ports = ['20', '21', '22', '23', '25', '53', '80', '110', '123', '443', '3389', '5900']
    for (let i = 0; i < m; i++) {
      if (!this.global_lock) {
        let from = null
        let to = null
        const random_value = type_of_data[Math.floor(Math.random() * type_of_data_length)]
        const temp_color = this.random_bg_color()
        if (random_value === 'Countries') {
          from = this.qb_world_countries[Math.floor(Math.random() * max_len_world_countries)].properties.cc
          to = this.qb_world_countries[Math.floor(Math.random() * max_len_world_countries)].properties.cc
          if (from && to && from !== to && !from.includes('-99') && !to.includes('-99')) {
            this.add_to_data_to_table({
              from: from,
              to: to,
            }, {
              line: {
                from: temp_color,
                to: temp_color
              },
              country: {
                from: temp_color,
                to: temp_color
              }
            }, timeout, ['line', 'multi-output', 'single-output'])
          }
        } else if (random_value === 'Cities') {
          const from = Object.keys(this.qb_world_cities)[Math.floor(Math.random() * max_len_world_cities)]
          const to = Object.keys(this.qb_world_cities)[Math.floor(Math.random() * max_len_world_cities)]
          if (from && to && from !== to) {
            this.add_to_data_to_table({
              from: from,
              to: to
            }, {
              line: {
                from: temp_color,
                to: temp_color
              },
              country: {
                from: temp_color,
                to: temp_color
              }
            }, timeout, ['line', 'multi-output', 'single-output'])
          }
        } else if (random_value === 'IPs') {
          const temp_from = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
          const temp_to = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
          const port = random_ports[Math.floor(Math.random() * random_ports.length)]
          from = temp_from.join('.')
          to = temp_to.join('.')
          if (from && to && from !== to) {
            this.add_to_data_to_table({
              from: from,
              to: to + ':' + port
            }, {
              line: {
                from: temp_color,
                to: temp_color
              },
              country: {
                from: temp_color,
                to: temp_color
              }
            }, timeout, ['line', 'multi-output', 'single-output'])
          }
        } else if (random_value === 'Coordinates') {
          from = [Math.random() * 360 - 180, Math.random() * 360 - 180]
          to = [Math.random() * 360 - 180, Math.random() * 360 - 180]
          if (from && to && from !== to) {
            this.add_to_data_to_table({
              from: from,
              to: to
            }, {
              line: {
                from: temp_color,
                to: temp_color
              },
              country: {
                from: temp_color,
                to: temp_color
              }
            }, timeout, ['line', 'multi-output', 'single-output'])
          }
        }
        await this.delay(delay)
      } else {
        this.verbose && console.log('interface is not visable')
      }
    }
  }
}
//{disable_obfuscation_end}//
