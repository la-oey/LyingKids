setwd("/Users/loey/Desktop/Research/FakeNews/LyingKids/Expt1_web/analysis/pilot_kids")
library(tidyverse)
library(lme4)
library(lmerTest)
library(pwr)
df <- read_csv("data.csv")

glimpse(df)
length(unique(df$subjID)) # 9 subjects

df %>%
  select(subjID, playerColor) %>%
  distinct() %>%
  count(playerColor) # 20 blue and 7 red
  
df_unified <- df %>%
  mutate(k = ifelse(liarPlayer=="blue", drawnBlue, drawnRed),
         kstar = reportedDrawn) %>%
  select(subjID, playerColor, trialNumber, playerRole, k, kstar, callBS, redTrialScore, blueTrialScore, responseTime, trialTime)

sender <- df_unified %>%
  filter(playerRole == "liar") %>%
  mutate(truth = as.numeric(k==kstar))
receiver <- df_unified %>%
  filter(playerRole == "detector")





summary(lmer(kstar ~ k + (1 | subjID), data=sender))
summary(lm(kstar ~ k, data=sender))
rsq <- cor.test(sender$kstar, sender$k)$estimate^2

summary(lmer(kstar ~ k + (1 | subjID), data=filter(sender, k != kstar)))

summary(glmer(truth ~ k + (1 | subjID), family="binomial", data=sender))

nrow(sender)
pwr.f2.test(u=1, f2=rsq/(1-rsq), sig.level=0.05, power=0.8)
pwr.2p.test(h=ES.h(0.55,0.40), sig.level = 0.05, power=0.8)

