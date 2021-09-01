#!/bin/bash

echo "QeeqBox Raven offline starter"

declare -a links=("https://d3js.org/d3.v5.min.js" "https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" "https://code.jquery.com/jquery-1.12.4.js" "https://code.jquery.com/ui/1.12.1/jquery-ui.js" "https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css")

for link in "${links[@]}"
do
 echo  "Downloading " $link
   wget -P offline $link > /dev/null
done

echo "Done, open Raven interface -> index_offline.html"
