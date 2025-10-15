#!/bin/bash

if cp ./dataExtracted/US_congress.csv ../iases3collector/data/fax/; then
    printf "\nUS_congress.csv has been copied to iases3collector/data/fax\n"
else
    printf "\nCoping US_congress.csv to iases3collector failed!\n"
fi