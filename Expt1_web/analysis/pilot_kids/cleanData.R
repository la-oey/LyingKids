setwd("/Users/loey/Desktop/Research/FakeNews/LyingKids/Expt1_web/analysis/pilot_kids")
library(tidyverse)

raw <- read_csv("raw.csv")
length(unique(raw$subjID))


trialsCompl <- raw %>%
  group_by(subjID) %>%
  summarise(n = n()) %>%
  arrange(n)
write_csv(trialsCompl, "subjByTrialsCompl.csv")

cleaned <- raw %>%
  filter(!subjID %in% filter(trialsCompl, n<22)$subjID)

allTrials <- cleaned

df <- cleaned %>%
  filter(exptPart == "trial")

write_csv(df, "data.csv")


