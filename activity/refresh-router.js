const express = require('express');
const axios = require('axios');
const Activity = require('./activity-model.js');
const cron = require('node-cron');


const router = express.Router();

router.get("/refresh", (req, res) => {
    res.json({'refresh triggered': 'yes'});

//latest
//get latest from DB
Activity.checksum('activity').then(res => {
    const arrayValues = res.map(a=> a.usgs_id)
    const dbChecksum = JSON.stringify(arrayValues) //create the checksum for DB items
    // console.log(dbChecksum)

    //Get the params for query ready
    //Dates
    var today = new Date();
    const ymd = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    const sevenDays = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()-7}`;
    // console.log('current date:', ymd);
    // console.log('7 days ago:', sevenDays);
    const starttime = sevenDays;
    const endtime = ymd;

    //Other params
    const minmagnitude = 0
    const maxmagnitude = 15
    const maxradiuskm = 20000
    const latitude = 37.78197
    const longitude = -121.93992
  
    //Use params to get latest from USGS
    axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=30&starttime=${starttime}&endtime=${endtime}&minmagnitude=${minmagnitude}&maxmagnitude=${maxmagnitude}&maxradiuskm=${maxradiuskm}&latitude=${latitude}&longitude=${longitude}&orderby=magnitude`)
    .then(async response=>{
      const resUnsortedValues = response.data.features.map(a => a.id)
      const resValues = resUnsortedValues.sort(); //sort asc - important to compare checksums!
      const resChecksum = JSON.stringify(resValues) //create the checksum for the latest items from USGS
      // console.log(resChecksum)
    
      //check if changed
      const compared = dbChecksum.localeCompare(resChecksum) //compare the two checksum strings 0=same, 1 or -1 if different(shows sort order)
      console.log('checksum result:', compared)

      if (compared == 0){
        console.log('first-load: nothing to change in DB, checksum of DB **MATCHES** checksum of latest from USGS') //therefore do nothing
      } else {
        console.log('first-load: writing new DB, checksum of latest from USGS is **DIFFERENT** from checksum of DB') //therefore change it up!
         //wipe existing table
         const geoWipe = await Activity.delAllRecords('geometry') //wipe them in same order as migration rollback
         console.log('geometry', geoWipe)
         const activityWipe = await Activity.delAllRecords('activity')
         console.log('activity', activityWipe)

         //add new response to table
         console.log('first-load: adding new activity to DB')
        let newFeatures=response.data.features.map(feature=>{ 
          feature.properties.usgs_id=feature.id;
          feature.geometry.usgs_id=feature.id
          feature.geometry.coordinates=JSON.stringify(feature.geometry.coordinates)
          Activity.addActivity(feature.properties, 'activity')
          Activity.addGeometry(feature.geometry, 'geometry')
        })
      }
    })
    .catch(error=>{
      console.log(error)
    });
  })
  .catch(error => {
      console.log(error)
  })

//all time biggest
console.log('all time running')
  //get latest from DB
  Activity.checksum('all_time').then(res => {
    const arrayValues = res.map(a=> a.usgs_id)
    const dbChecksum = JSON.stringify(arrayValues) //create the checksum for DB items
    // console.log(dbChecksum)

    //Get the params for query ready
    //Dates
    var today = new Date();
    const ymd = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    // console.log('current date:', ymd);
    // console.log('7 days ago:', sevenDays);
    const starttime = '1880-01-01';
    const endtime = ymd;

    //Other params
    const minmagnitude = 7
    const maxmagnitude = 15
    const maxradiuskm = 20000
    const latitude = 37.78197
    const longitude = -121.93992
    //top 100
  
    //Use params to get latest from USGS
    axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=30&starttime=${starttime}&endtime=${endtime}&minmagnitude=${minmagnitude}&maxmagnitude=${maxmagnitude}&maxradiuskm=${maxradiuskm}&latitude=${latitude}&longitude=${longitude}&orderby=magnitude`)
    .then(async response=>{
      const resUnsortedValues = response.data.features.map(a => a.id)
      const resValues = resUnsortedValues.sort(); //sort asc - important to compare checksums!
      const resChecksum = JSON.stringify(resValues) //create the checksum for the latest items from USGS
      console.log(resChecksum)
    
      //check if changed
      const compared = dbChecksum.localeCompare(resChecksum) //compare the two checksum strings 0=same, 1 or -1 if different(shows sort order)
      console.log('checksum result:', compared)

      if (compared == 0){
        console.log('alltime-biggest: nothing to change in DB, checksum of DB **MATCHES** checksum of latest from USGS') //therefore do nothing
      } else {
        console.log('alltime-biggest: writing new DB, checksum of latest from USGS is **DIFFERENT** from checksum of DB') //therefore change it up!
         //wipe existing table
         const geo_all_timeWipe = await Activity.delAllRecords('geometry_all_time') //wipe them in same order as migration rollback
         console.log('geometry_all_time table wiped', geo_all_timeWipe)
         const all_timeWipe = await Activity.delAllRecords('all_time')
         console.log('all_time table wiped', all_timeWipe)

         //add new response to table
         console.log('all_time: adding new activity to DB')
        let newFeatures=response.data.features.map(feature=>{ 
          feature.properties.usgs_id=feature.id;
          feature.geometry.usgs_id=feature.id
          feature.geometry.coordinates=JSON.stringify(feature.geometry.coordinates)
          Activity.addActivity(feature.properties, 'all_time')
          Activity.addGeometry(feature.geometry, 'geometry_all_time')
        })
      }
    })
    .catch(error=>{
      console.log(error)
    });
  })

//nukes
console.log('nukes running')
    //get latest from DB
    Activity.checksum('nukes').then(res => {
      const arrayValues = res.map(a=> a.usgs_id)
      const dbChecksum = JSON.stringify(arrayValues) //create the checksum for DB items
      // console.log(dbChecksum)
  
      //Get the params for query ready
      //Dates
      var today = new Date();
      const ymd = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
      // console.log('current date:', ymd);
      // console.log('7 days ago:', sevenDays);
      const starttime = '1880-01-01';
      const endtime = ymd;
  
      //Other params
      const minmagnitude = 5
      const maxmagnitude = 15
      const maxradiuskm = 20000
      const latitude = 37.78197
      const longitude = -121.93992
      //top 100
    
      //Use params to get latest nukes from USGS
      axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=10&starttime=${starttime}&endtime=${endtime}&minmagnitude=${minmagnitude}&maxmagnitude=${maxmagnitude}&maxradiuskm=${maxradiuskm}&latitude=${latitude}&longitude=${longitude}&eventtype=nuclear%20explosion&orderby=magnitude`)
      .then(async response=>{
        const resUnsortedValues = response.data.features.map(a => a.id)
        const resValues = resUnsortedValues.sort(); //sort asc - important to compare checksums!
        const resChecksum = JSON.stringify(resValues) //create the checksum for the latest items from USGS
        console.log(resChecksum)
      
        //check if changed
        const compared = dbChecksum.localeCompare(resChecksum) //compare the two checksum strings 0=same, 1 or -1 if different(shows sort order)
        console.log('checksum result:', compared)
  
        if (compared == 0){
          console.log('nukes: nothing to change in DB, checksum of DB **MATCHES** checksum of latest from USGS') //therefore do nothing
        } else {
          console.log('nukes: writing new DB, checksum of latest from USGS is **DIFFERENT** from checksum of DB') //therefore change it up!
           //wipe existing table
           const nukesGeoWipe = await Activity.delAllRecords('geometry_nukes') //wipe them in same order as migration rollback
           console.log('geometry_nukes table wiped', nukesGeoWipe)
           const nukesWipe = await Activity.delAllRecords('nukes')
           console.log('nukes wiped', nukesWipe)
  
           //add new response to table
           console.log('nukes: adding new activity to DB')
          let newFeatures=response.data.features.map(feature=>{ 
            feature.properties.usgs_id=feature.id;
            feature.geometry.usgs_id=feature.id
            feature.geometry.coordinates=JSON.stringify(feature.geometry.coordinates)
            Activity.addActivity(feature.properties, 'nukes')
            Activity.addGeometry(feature.geometry, 'geometry_nukes')
          })
        }
      })
      .catch(error=>{
        console.log(error)
      });
    })

});



  module.exports = router;
