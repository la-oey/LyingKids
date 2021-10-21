setwd("/Users/loey/Desktop/Research/FakeNews/LyingKids/Expt1_web/analysis/SONA")
library(tidyverse)

raw <- read_csv("raw.csv")
length(unique(raw$subjID))

demograph <- raw %>%
  select(subjID, stillimages, comments) %>%
  distinct()
write_csv(demograph, "demographic.csv")

cleaned <- raw %>%
  select(-c(stillimages, comments))

trialsCompl <- cleaned %>%
  group_by(subjID) %>%
  summarise(n = n()) %>%
  arrange(n)
write_csv(trialsCompl, "subjByTrialsCompl.csv")

cleaned <- cleaned %>%
  filter(!subjID %in% filter(trialsCompl, n<22)$subjID)

allTrials <- cleaned

df <- cleaned %>%
  filter(exptPart == "trial")

write_csv(df, "data.csv")
