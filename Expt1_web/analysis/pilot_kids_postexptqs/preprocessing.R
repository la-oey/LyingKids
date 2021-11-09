setwd("/Users/loey/Desktop/Research/FakeNews/LyingKids/Expt1_web/analysis/pilot_kids_postexptqs/")
library(tidyverse)

raw.jt <- read_csv("raw_coding_Jason.csv")
raw.dw <- read_csv("raw_coding_Diana.csv")

distinct(raw.jt, Question)

glimpse(raw.jt)
glimpse(raw.dw)

# each coder gets their own row
df.long <- raw.jt %>%
  mutate(coder = "JT") %>%
  bind_rows(mutate(raw.dw, coder = "DW")) %>%
  rename(CodeQ = `What is being coded`,
         CodeA = `Code Response`) %>%
  mutate(maybe = str_detect(CodeA, "\\*"),
         CodeA = str_remove(CodeA, "\\*"),
         CodeA = tolower(CodeA),
         CodeQ = case_when(
           CodeQ == "Opponent’s points? Y vs" ~ "Opponent’s points? Y vs N",
           CodeQ == "0 to 6 marbles for themselve" ~ "0 to 6 marbles for themselves",
           TRUE ~ CodeQ
         ))
write.csv(df.long, "processedDat_long.csv")

# side by side comparison of coder responses
DW.maybe <- df.long %>%
  filter(coder == "DW") %>%
  select(-c(coder, CodeA))
df.sidebyside <- df.long %>%
  select(-c(Notes, maybe)) %>%
  spread(coder, CodeA) %>%
  left_join(DW.maybe) %>%
  rename(DW.maybe = maybe)
write.csv(df.sidebyside, "processedDat_sidebyside.csv")

# look at cases where coders don't agree
df.disagree <- df.sidebyside %>%
  filter(DW != JT)
write.csv(df.disagree, "processedDat_disagree.csv")

